import React from 'react';
import { DocumentEditor } from '@onlyoffice/document-editor-react';
// import jwt from 'jsonwebtoken';

var onDocumentReady = function (event) {
    console.log("Document is loaded");
};



// const payload = {
//     "sub": "1234567890",
//     "name": "John Doe",
//     "admin": true
// };

// const secretkey = "EIHqWso7Ld0AyZXXDQgqNDBWILWJOAmQ";

function Home() {
    // const token = jwt.sign(payload, secretkey);
    
    return (
        <DocumentEditor
            id="docxEditor"
            documentServerUrl="https://editor.office.usln.in"
            config={{
                "document": {
                    "fileType": "docx",
                    'key': 'Khirz6zTPdfe',
                    "title": "question1_solution.docx",
                    "url": "https://editor.office.usln.in/example/editor?fileName=question1_solution.docx"
                },
                "token":"EIHqWso7Ld0AyZXXDQgqNDBWILWJOAmQ",
                "documentType": "word"

              
            }}
            events_onDocumentReady={onDocumentReady}
        />
    );
}

export default Home;
