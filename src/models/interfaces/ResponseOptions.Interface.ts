export interface IResponseOptions {
    statusCode? :number,
    status : "success" | "error",
    msgCode?: number | string ,
    msg?: string,
    data?:any;
}