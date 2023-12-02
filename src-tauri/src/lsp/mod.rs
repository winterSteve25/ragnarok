mod client;

use std::process::{Command, Stdio};

#[tauri::command]
pub fn start_client() {
    let process = Command::new("")
        .stdin(Stdio::piped())
        .stderr(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .expect("Failed to start LSP server");
}