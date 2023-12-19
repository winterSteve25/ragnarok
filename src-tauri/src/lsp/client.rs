use std::process::Child;
use lsp_types::{ClientCapabilities, ClientInfo, InitializeParams, Url};
use serde_json::Value;
use crate::errors::LSPError;
use crate::lsp::transport::Transport;
use crate::PACKAGE_INFO;

pub struct Client {
    transport: Transport,
    process: Child,
}

impl Client {
    pub fn new(transport: Transport, child: Child) -> Self {
        Self {
            transport,
            process: child,
        }
    }

    pub fn initialize(&mut self, workspace_dir: Option<Url>, initialization_options: Option<Value>, capabilities: Option<ClientCapabilities>) -> Result<(), LSPError> {
        println!("Client initialized");

        self.transport.send(&InitializeParams {
            client_info: Some(ClientInfo {
                name: "Ragnarok Editor".to_string(),
                version: Some(unsafe { PACKAGE_INFO.clone().unwrap().version.to_string() }),
            }),
            process_id: Some(self.process.id()),
            root_uri: workspace_dir,
            initialization_options,
            capabilities: capabilities.unwrap_or_default(),
            workspace_folders: None,
            locale: None,
            ..Default::default()
        })?;

        Ok(())
    }
}