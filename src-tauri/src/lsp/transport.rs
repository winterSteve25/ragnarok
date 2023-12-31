use std::io::{BufReader, BufWriter, Write};
use std::process::{ChildStderr, ChildStdin, ChildStdout};
use serde::{Deserialize, Serialize};
use crate::errors::LSPError;

pub struct Transport {
    input: BufWriter<ChildStdin>,
    output: BufReader<ChildStdout>,
    errs: BufReader<ChildStderr>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Message<T> where T : ?Sized + Serialize {
    jsonrpc: String,
    method: String,
    id: usize,
    #[serde(flatten)]
    params: T,   
}

impl Transport {
    pub fn start(input: BufWriter<ChildStdin>, output: BufReader<ChildStdout>, errs: BufReader<ChildStderr>) -> Self {
        let transport = Self {
            input,
            output,
            errs
        };
        
        transport
    }
    
    pub fn send<T>(&mut self, method: &str, value: &T) -> Result<(), LSPError>
        where T : ?Sized + Serialize 
    {
        let message = Message {
            jsonrpc: "2.0".to_string(),
            method: method.to_string(),
            id: 1,
            params: value,
        };
        
        let serialized = serde_json::to_vec(&message)?;
        self.input.write_all(&serialized)?;
        self.input.flush()?;
        
        Ok(())
    }
}