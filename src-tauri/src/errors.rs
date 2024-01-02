use std::io;
use std::num::ParseIntError;
use log::error;
use serde::{Serialize, Serializer};
use serde_json::Value;
use thiserror::Error;

use crate::lsp::types::{Message, ResponseError, ResponseMessage};

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
    
    #[error("Error when transporting data with the LS: {0:?}")]
    IO(#[from] io::Error),

    #[error("Expected a \r\n after the header of the response, but {0:?} was found")]
    InvalidFormat(String),
    
    #[error("Failed to send response {0:?} to requester")]
    FailedToProcessResponse(ResponseMessage<Value>),

    #[error("Failed to send method '{0:?}' to the LS via unbounded channel")]
    FailedToSend(Message),
    
    #[error("Failed to parse content length of response")]
    FailedToParseContentLength(#[from] ParseIntError),
    
    #[error("Expected response but non was received")]
    NoResponse,
    
    #[error("Sent response to server")]
    SentResponse,
    
    #[error("Sent request with duplicate ID")]
    DuplicateID,
    
    #[error("{0}")]
    ResponseError(ResponseError),
    
    #[error("LS already running")]
    ServerRunning,
}

impl Serialize for LSPError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: Serializer {
        serializer.serialize_str(self.to_string().as_str())
    }
}
