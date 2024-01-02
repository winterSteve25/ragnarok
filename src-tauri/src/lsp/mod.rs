mod transport;
pub mod types;
pub mod client;

use std::collections::HashMap;
use std::io::{BufReader, BufWriter};
use std::process::{Command, Stdio};
use lsp_types::{ClientCapabilities, SemanticTokensResult, ServerCapabilities, Url};
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
    lsp_clients: State<'_, RwLock<HashMap<String, LSPClient>>>,
) -> Result<ServerCapabilities, LSPError> {
    if let Some(client) = lsp_clients.read().await.get(&language) {
        return Ok((&client.server_capabilities).clone().unwrap());
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
    let capabilities = (&client.server_capabilities).clone();
    lsp_clients.write().await.insert(language, client);

    Ok(capabilities.unwrap())
}

#[tauri::command]
pub async fn semantic_tokens(language: String, lsp_clients: State<'_, RwLock<HashMap<String, LSPClient>>>) -> Result<SemanticTokensResult, LSPError> {
    match lsp_clients.write().await.get_mut(&language) {
        None => Err(LSPError::LSNotRunning(language)),
        Some(_client) => {
            todo!()
        }
    }
}
