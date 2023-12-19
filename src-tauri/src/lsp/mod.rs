mod client;
mod transport;

use std::collections::HashMap;
use std::io::{BufReader, BufWriter};
use std::process::{Command, Stdio};
use lsp_types::{ClientCapabilities, Url};
use serde_json::Value;
use crate::errors::LSPError;
use crate::lsp::client::Client;
use crate::lsp::transport::Transport;

#[tauri::command]
pub fn start_ls(lsp_bin: &str, args: Vec<String>, env: HashMap<String, String>, workspace_dir: Option<String>, initialization_options: Option<Value>, capabilities: ClientCapabilities) -> Result<(), LSPError> {
    let mut process = Command::new(lsp_bin)
        .args(args)
        .envs(env)
        .stdin(Stdio::piped())
        .stderr(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .expect("Failed to start LSP server");

    let input = BufWriter::new(process.stdin.take().expect("Failed to open Language Server stdin"));
    let output = BufReader::new(process.stdout.take().expect("Failed to open Language Server stdin"));
    let err = BufReader::new(process.stderr.take().expect("Failed to open Language Server stdin"));
    let transport = Transport::start(input, output, err);

    let mut client = Client::new(transport, process);
    client.initialize(workspace_dir.map(|str| Url::parse(&str)).transpose().unwrap_or(None), initialization_options, capabilities)
}