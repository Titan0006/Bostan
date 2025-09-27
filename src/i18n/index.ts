import en from "../i18n/en.json" with {type:'json'}

type LanguageFile = Record<string,string>

function getLanguage(lan="en"){
    if(lan=="en"){
        return en as LanguageFile;
    }
    return en as LanguageFile;
}

export default function getMessage(code:number,lan="en"){
    let language = getLanguage(lan);
    const message = language[String(code)];
    return message;
}