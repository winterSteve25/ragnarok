use std::fmt::{Display, Formatter};
use lsp_types::lsif::Id;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
pub enum Message {
    Response(ResponseMessage<Value>),
    Request(RequestMessage<Value>),
    Notification(NotificationMessage<Value>),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ResponseMessage<T> where T : Sized + Serialize {
    pub result: T,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<ResponseError>,
    pub jsonrpc: String,
    pub id: Id,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RequestMessage<T> where T : Sized + Serialize {
    pub params: Option<T>,
    pub method: String,
    pub jsonrpc: String,
    pub id: Id,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NotificationMessage<T> where T : Sized + Serialize  {
    pub method: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub params: Option<T>,
    pub jsonrpc: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ResponseError {
    code: i32,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    data: Option<Value>,
}

impl Display for ResponseError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "Response Error - Code: {} Message: {}, Data: {:?}", self.code, self.message, self.data)
    }
}
