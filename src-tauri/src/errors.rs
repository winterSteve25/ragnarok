use std::io;
use serde::{Deserialize, Serialize, Serializer};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum FSError {
    #[error("{0:?}")]
    IO(#[from] io::Error),
}

impl Serialize for FSError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: Serializer {
        serializer.serialize_str(self.to_string().as_str())
    }
}

#[derive(Error, Debug)]
pub enum LSPError {
    #[error("Serialization Error: {0:?}")]
    Serialization(#[from] serde_json::Error),
    
    #[error("Error when transporting data to the LS: {0:?}")]
    LspIn(#[from] io::Error),
    
    #[error("Error when transporting data to the LS: Buffer sent is not fully written")]
    BufferUnfinished,
}

impl Serialize for LSPError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: Serializer {
        serializer.serialize_str(self.to_string().as_str())
    }
}