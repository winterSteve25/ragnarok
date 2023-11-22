use std::io;
use serde::{Serialize, Serializer};
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