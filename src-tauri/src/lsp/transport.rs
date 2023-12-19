use std::io::{BufReader, BufWriter, Write};
use std::process::{ChildStderr, ChildStdin, ChildStdout};
use serde::Serialize;
use crate::errors::LSPError;

pub struct Transport {
    input: BufWriter<ChildStdin>,
    output: BufReader<ChildStdout>,
    errs: BufReader<ChildStderr>,
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
    
    pub fn send<T>(&mut self, value: &T) -> Result<(), LSPError>
        where T : ?Sized + Serialize 
    {
        let load = serde_json::to_vec(value)?;
        let len_written = self.input.write(&load)?;
        
        if len_written != load.len() { 
            return Err(LSPError::BufferUnfinished);
        }
        
        Ok(())
    }
}