mod transport;
pub mod types;
pub mod client;

use std::collections::HashMap;
use std::io::{BufReader, BufWriter};
use std::process::{Command, Stdio};
use lsp_types::{ClientCapabilities, Url};
use serde_json::Value;
use tauri::{AppHandle, State};
use tokio::sync::RwLock;
use crate::errors::LSPError;
use crate::lsp::client::LSPClient;
use crate::lsp::transport::Transport;

#[tauri::command]
pub async fn start_ls(
    language: String,
    lsp_bin: &str,
    args: Vec<String>,
    env: HashMap<String, String>,
    workspace_dir: Option<String>,
    initialization_options: Option<Value>,
    capabilities: Option<ClientCapabilities>,
    app_handle: AppHandle,
    lsp_clients: State<'_, RwLock<HashMap<String, LSPClient>>>
) -> Result<(), LSPError> {
    
    if let Some(_) = lsp_clients.read().await.get(&language) {
        return Err(LSPError::ServerRunning);
    }
    
    let mut process = Command::new(lsp_bin)
        .args(args)
        .envs(env)
        .stdin(Stdio::piped())
        .stderr(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .expect("Failed to start LSP server");

    let stdin = BufWriter::new(process.stdin.take().expect("Failed to open Language Server stdin"));
    let stdout = BufReader::new(process.stdout.take().expect("Failed to open Language Server stdin"));
    let stderr = BufReader::new(process.stderr.take().expect("Failed to open Language Server stdin"));
    let sender = Transport::start(stdin, stdout, stderr);
    
    let mut client = LSPClient::new(language.clone(), sender, process);
    client.start(workspace_dir.map(|str| Url::parse(&str)).transpose().unwrap_or(None), initialization_options, capabilities, app_handle.package_info()).await?;
    lsp_clients.write().await.insert(language, client);
    
    Ok(())
}
