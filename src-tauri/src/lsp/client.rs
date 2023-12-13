use crate::lsp::transport::Transport;

pub struct Client {
    transport: Transport
}

impl Client {
    pub fn new(transport: Transport) -> Self {
        Self {
            transport
        }
    }

    pub fn initialize(&self) -> Result<(), ()> {
        println!("Client initialized");
        
        Ok(())
    }
}