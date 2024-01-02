use std::collections::HashMap;
use std::io::{BufRead, BufReader, BufWriter, Read, Write};
use std::process::{ChildStderr, ChildStdin, ChildStdout};
use std::sync::{Arc, RwLock};
use tauri::async_runtime;
use tokio::sync::mpsc::{unbounded_channel, UnboundedSender, UnboundedReceiver};
use tokio::sync::mpsc::error::TryRecvError;
use log::{error, warn};
use lsp_types::lsif::Id;
use serde_json::Value;
use crate::errors::LSPError;
use crate::lsp::types::{Message, ResponseMessage};

const HEADER_TEXT: &str = "Content-Length:";
const HEADER_TEXT_LEN: usize = 15;

type ResponseAwaiters = HashMap<Id, UnboundedSender<ResponseMessage<Value>>>;

pub struct Transport;

impl Transport {
    pub fn start(stdin: BufWriter<ChildStdin>, stdout: BufReader<ChildStdout>, stderr: BufReader<ChildStderr>) -> UnboundedSender<(Message, Option<UnboundedSender<ResponseMessage<Value>>>)> {
        let awaiting_responses = Arc::new(RwLock::new(HashMap::new()));

        // server receiver receives data the client wants to send to the LS and writes to stdin
        // server sender takes data from stdout and sends it to transport_receiver
        // this way writing and reading from stdin/stdout does not block the main thread
        let (transport_sender, server_receiver) = unbounded_channel();

        async_runtime::spawn(Transport::receive(stdout, awaiting_responses.clone()));
        async_runtime::spawn(Transport::send(stdin, server_receiver, awaiting_responses));
        async_runtime::spawn(Transport::err(stderr));

        transport_sender
    }

    async fn receive(mut stdout: BufReader<ChildStdout>, response_awaiters: Arc<RwLock<ResponseAwaiters>>) -> Result<(), LSPError> {
        let mut buffer = String::new();
        let mut content_buffer: Vec<u8> = Vec::new();

        loop {
            buffer.clear();

            if stdout.read_line(&mut buffer)? == 0 {
                continue;
            }

            if buffer.starts_with(HEADER_TEXT) {
                let slice: &str = &buffer.as_str()[HEADER_TEXT_LEN..];
                let content_len: usize = slice.trim().parse()?;

                if content_len > content_buffer.capacity() {
                    content_buffer.resize(content_len, 0);
                }

                // after the header it should be another line of \r\n
                buffer.clear();
                stdout.read_line(&mut buffer)?;

                if &buffer != "\r\n" {
                    return Err(LSPError::InvalidFormat(buffer));
                }

                stdout.read_exact(&mut content_buffer[0..content_len])?;
                let result: ResponseMessage<Value> = serde_json::from_slice(&content_buffer[0..content_len])?;

                match response_awaiters.write().unwrap().remove(&result.id) {
                    None => warn!("Response received with ID but no sender was found"),
                    Some(sender) => sender.send(result).map_err(|e| LSPError::FailedToProcessResponse(e.0)).unwrap(),
                }
            }
        }
    }

    async fn send(mut stdin: BufWriter<ChildStdin>, mut server_receiver: UnboundedReceiver<(Message, Option<UnboundedSender<ResponseMessage<Value>>>)>, response_awaiters: Arc<RwLock<ResponseAwaiters>>) -> Result<(), LSPError> {
        loop {
            match server_receiver.try_recv() {
                Err(TryRecvError::Empty) => continue,
                Err(TryRecvError::Disconnected) => break,
                Ok((msg, sender)) => {
                    match msg {
                        Message::Response(_) => return Err(LSPError::SentResponse),
                        Message::Request(ref params) => {
                            if let Some(sender) = sender {
                                match response_awaiters.write().unwrap().insert(params.id.clone(), sender) {
                                    Some(_) => return Err(LSPError::DuplicateID),
                                    None => {},
                                }
                            }
                        }
                        Message::Notification(_) => {}
                    }

                    let content = serde_json::to_vec(&msg)?;
                    let content_len = content.len();
                    let header = format!("Content-Length: {}\r\n\r\n", content_len);

                    stdin.write_all(header.as_bytes())?;
                    stdin.write_all(&content)?;
                    stdin.flush()?;
                }
            }
        }

        Ok(())
    }

    async fn err(mut stderr: BufReader<ChildStderr>) -> Result<(), LSPError> {
        let mut buffer = String::new();
        loop {
            buffer.clear();

            if stderr.read_line(&mut buffer)? == 0 {
                continue;
            }

            error!("LS Error - {}", buffer);
        }
    }
}
