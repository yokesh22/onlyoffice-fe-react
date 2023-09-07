import React, { useState, useEffect } from "react";
import axios from "axios";
import { DocumentEditor } from "@onlyoffice/document-editor-react";

function TabBar() {
  const [activeTab, setActiveTab] = useState("editor");
  const [studentConfigData, setStudentConfigData] = useState(null);
  const [solutionConfigData, setSolutionData] = useState(null);
  const [saveAsEvent, setSaveAsEvent] = useState(null);
  const session_id = "12345";
  const username = "yokesh@gmail.com";
  const password = "vidhai";
  const user = username.split("@");
  const solution = "exercise1";
  // const eval_url  = "https://api.vidhai.office.usln.in/evaluate";
  const eval_url = "http://localhost:9005/evaluate";

  useEffect(() => {
    fetchConfigData(
      `http://localhost:3000/editor?fileName=yokesh_question1_student.docx`,
      "student"
    );
    fetchConfigData(
      `http://localhost:3000/editor?fileName=solution_question1.docx`,
      "solution"
    );
  }, []);


  const fetchConfigData = async (url, StudentorSolution) => {
    try {
      console.log("url = ", url);
      const response = await axios.get(url);
      console.log("response = ", response);
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.data, "text/html");
      const scriptIndex = 1;
      const scriptElements = doc.querySelectorAll("script");
      const scriptElement = scriptElements[scriptIndex];
      const scriptContent = scriptElement.textContent;
      const variableName = "config";
      const regex = new RegExp(`${variableName}\\s*=\\s*({[^;]+});`);
      const match = scriptContent.match(regex);

      if (match && match[1]) {
        try {
          const configObject = JSON.parse(match[1]);
          console.log(configObject);
          StudentorSolution === "student"
            ? setStudentConfigData(configObject)
            : setSolutionData(configObject);
        } catch (error) {
          console.log("Error parsing JSON:", error);
        }
      } else {
        console.log("Variable not found or not properly defined.");
      }
    } catch (error) {
      console.error("Error fetching config data:", error);
    }
  };

  const saveas = () => {

    var iframe = document.querySelector('iframe[name="frameEditor"]');
    console.log("iframe = ",iframe)

    function handleMessage(event){
      if(event.origin !== 'https://localhost:3000'){
        return;
      }

      const messageData = event.data;

      console.log("received msg from iframe", messageData);
    }

    window.addEventListener('message', handleMessage);
    var messageToSend = 'Hello iframe!';
    // console.log( iframe.contentWindow.postMessage())
    // Send the message to the iframe
    iframe.contentWindow.postMessage(messageToSend, 'http://localhost:3000');
    console.log(messageToSend)
    
// Access the iframe's contentDocument
    // var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    iframe.addEventListener('load', function() {
      console.log('Iframe loaded');
      try {
        var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        console.log(iframeDocument);
        // Now you can safely access the iframe's document.
      } catch (error) {
        console.error('Error accessing iframe content:', error);
      }
    });
    

    
//     // Wait for the iframe's content to load
//     iframeDocument.addEventListener('DOMContentLoaded', function() {
//         // Now, you can interact with elements inside the iframe
//         var link = iframeDocument.querySelector('ul li a[data-tab="file"][data-title="File"]');
//         if (link) {
//             link.click();
//         }
//     });

  
    // var link = document.querySelector('ul li a[data-tab="file"][data-title="File"]'); 
    // if(link){
    //   link.click();
    // }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const savecopyAs = (event) => {
    console.log("event = ", event);
    var docEditor;

    var innerAlert = function (message, inEditor) {
      if (console && console.log) console.log(message);
      if (inEditor && docEditor) docEditor.showMessage(message);
    };
    console.log("event = ", event);
    var title = event.data.title;
    console.log("saveas - title = ", title);
    var url = event.data.url;
    console.log("save-copyas-url = ", url);
    var data = {
      title: title,
      url: url,
    };
    console.log(data);
    let xhr = new XMLHttpRequest();
    console.log(xhr);
    xhr.open("POST", "http://localhost:3000/create");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
    xhr.onload = function () {
      innerAlert(xhr.responseText);
      // innerAlert(JSON.parse(xhr.responseText).file, true);
    };
  };

  function EditorTabContent() {
    return (
      <div className="tab-body" style={{ height: "100vh" }}>
        {/* Content for the Editor tab */}
        {studentConfigData && (
          <DocumentEditor
            id="docxEditor"
            documentServerUrl="http://192.168.1.125:8050"
            config={studentConfigData}
            events_onRequestSaveAs={(event) => {
              console.log("event = ", event);
              //  setSaveAsEvent(event); // Update the event state
              savecopyAs(event);
            }}
          />
        )}
      </div>
    );
  }

  function SolutionTabContent() {
    return (
      <div className="tab-body" style={{ height: "100vh" }}>
        {/* Content for the Editor tab */}
        {studentConfigData && (
          <DocumentEditor
            id="docxEditor"
            documentServerUrl="http://192.168.1.125:8050"
            config={solutionConfigData}
          />
        )}
      </div>
    );
  }

  function evaluate() {
    console.log("evaluation...");

    fetch(eval_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: "yokesh",
        question_id: "question1",
        question_type: 1,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  return (
    <div>
      <h1 className="Tabs">
        <button
          id="editorbtn"
          className={`tab ${activeTab === "editor" ? "active" : ""}`}
          onClick={() => handleTabClick("editor")}
        >
          EDITOR
        </button>
        <button
          id="solutionbtn"
          className={`tab ${activeTab === "solution" ? "active" : ""}`}
          onClick={() => handleTabClick("solution")}
        >
          SOLUTION
        </button>
        <button
          id="evaluatebtn"
          className={`tab ${activeTab === "evaluate" ? "active" : ""}`}
          onClick={() => {
            // evaluate();
            saveas();
          }}
        >
          EVALUATE
        </button>
      </h1>
      <div className="tab-content">
        {activeTab === "editor" && (
          <EditorTabContent />
        )}
        {activeTab === "solution" && <SolutionTabContent />}
      </div>
    </div>
  );
}

export default TabBar;
