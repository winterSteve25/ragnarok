use std::process::Child;
use log::{error, info};
use lsp_types::lsif::Id;
use lsp_types::{ClientCapabilities, ClientInfo, InitializedParams, InitializeParams, InitializeResult, Url};
use serde::Serialize;
use serde_json::Value;
use tauri::PackageInfo;
use tokio::sync::mpsc::{unbounded_channel, UnboundedReceiver, UnboundedSender};
use crate::errors::LSPError;
use crate::lsp::types::{Message, NotificationMessage, RequestMessage, ResponseMessage};
use tauri::async_runtime;
use tokio::sync::mpsc::error::TryRecvError;
use tokio::task::block_in_place;

pub struct LSPClient {
    sender: UnboundedSender<(Message, Option<UnboundedSender<ResponseMessage<Value>>>)>,
    process: Child,
    name: String,
    id: i32,
}

impl Drop for LSPClient {
    fn drop(&mut self) {
        match block_in_place(|| {async_runtime::block_on(self.shutdown())}) {
            Err(e) => error!("Error when shutting down the language server for {}: {}", self.name, e),
            Ok(_) => {}
        }
    }
}

impl LSPClient {
    pub fn new(name: String, sender: UnboundedSender<(Message, Option<UnboundedSender<ResponseMessage<Value>>>)>, process: Child) -> Self {
        Self {
            sender,
            process,
            name,
            id: i32::MIN,
        }
    }
    
    async fn shutdown(&mut self) -> Result<(), LSPError> {
        // the type parameters are needed just to make the compiler happy
        self.request::<InitializedParams>("shutdown", None).await?;
        self.notify::<InitializedParams>("exit", None).await?;
        self.process.kill().expect(&*format!("Failed to shutdown the {} language server", self.name));
        Ok(())
    }

    pub async fn start(&mut self, workspace_dir: Option<Url>, initialization_options: Option<Value>, capabilities: Option<ClientCapabilities>, package_info: &PackageInfo) -> Result<(), LSPError> {
        let result = self.request("initialize", Some(InitializeParams {
            client_info: Some(ClientInfo {
                name: "Ragnarok Editor".to_string(),
                version: Some(package_info.version.to_string()),
            }),
            process_id: Some(self.process.id()),
            root_uri: workspace_dir,
            initialization_options,
            capabilities: capabilities.unwrap_or_default(),
            workspace_folders: None,
            locale: None,
            ..Default::default()
        })).await?;

        if let Some(err) = result.error {
            return Err(LSPError::ResponseError(err));
        }

        let _result: InitializeResult = serde_json::from_value(result.result)?;
        self.notify("initialized", Some(InitializedParams {})).await?;

        Ok(())
    }

    async fn notify<T>(&self, method: &str, param: Option<T>) -> Result<(), LSPError>
        where T: Serialize
    {
        self.sender.send((Message::Notification(NotificationMessage {
            params: param.map(|p| serde_json::to_value(p)).transpose()?,
            method: method.to_string(),
            jsonrpc: "2.0".to_string(),
        }), None)).map_err(|e| {
            LSPError::FailedToSend(e.0.0)
        })?;

        Ok(())
    }

    async fn request<T>(&mut self, method: &str, param: Option<T>) -> Result<ResponseMessage<Value>, LSPError>
        where T: Serialize
    {
        let (sender, receiver) = unbounded_channel();

        self.sender.send((Message::Request(RequestMessage {
            params: param.map(|p| serde_json::to_value(p)).transpose()?,
            method: method.to_string(),
            id: Id::Number(self.id),
            jsonrpc: "2.0".to_string(),
        }), Some(sender))).map_err(|e| {
            LSPError::FailedToSend(e.0.0)
        })?;

        self.id += 1;
        async_runtime::spawn(LSPClient::try_receive(receiver)).await.unwrap()
    }

    async fn try_receive(mut receiver: UnboundedReceiver<ResponseMessage<Value>>) -> Result<ResponseMessage<Value>, LSPError> {
        loop {
            match receiver.try_recv() {
                Ok(v) => {
                    info!("Received response from LS");
                    return Ok(v)
                },
                Err(TryRecvError::Disconnected) => return Err(LSPError::NoResponse),
                Err(TryRecvError::Empty) => continue,
            }
        }
    }
}
