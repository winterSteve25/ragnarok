// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;
use tauri::{async_runtime, Manager, RunEvent, State};
use tokio::sync::RwLock;
use tokio::task::block_in_place;
use crate::lsp::client::LSPClient;

mod fs;
mod errors;
mod lsp;

fn main() {
    let app = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            fs::get_files_in_path,
            fs::open_text_file,
            lsp::start_ls,
        ])
        .setup(|_app| {
            env_logger::init();
            Ok(())
        })
        .manage(RwLock::new(HashMap::<String, LSPClient>::new()))
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(move |app, event| {
        if let RunEvent::ExitRequested { api: _, .. } = event {
            let lsp_client: State<'_, RwLock<HashMap<String, LSPClient>>> = app.state();
            block_in_place(|| {async_runtime::block_on(shutdown_lsp_client(lsp_client.inner()))});
        }
    });
}

async fn shutdown_lsp_client(lsp_client: &RwLock<HashMap<String, LSPClient>>) {
    lsp_client.write().await.clear();
}