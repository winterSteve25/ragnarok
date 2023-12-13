use std::io::{BufReader, BufWriter};
use std::process::{ChildStderr, ChildStdin, ChildStdout};

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
}