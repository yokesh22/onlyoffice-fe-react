import React, { useState, useEffect } from "react";
import axios from "axios";
import { DocumentEditor } from "@onlyoffice/document-editor-react";


const TabComponent = () => {
  const [activeTab, setActiveTab] = useState("tab1");
  const [studentContent, setStudentContent] = useState(null);
  const [solutionContent, setSolutionContent] = useState(null);

  useEffect(() => {
    // Fetch content for the student tab
    if (activeTab === "student" && !studentContent) {
      fetchContent(
        "http://localhost:3000/editor?fileName=yokesh_question1_student.docx",
        setStudentContent
      );
    }
    // Fetch content for the solution tab
    if (activeTab === "solution" && !solutionContent) {
      fetchContent(
        "http://localhost:3000/editor?fileName=solution_question1.docx",
        setSolutionContent
      );
    }
  }, [activeTab, studentContent, solutionContent]);

  const fetchContent = async (url, setContent) => {
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
          studentContent === "student"
            ? setStudentContent(configObject)
            : setSolutionContent(configObject);
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


  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <div>
        <button
          onClick={() => handleTabClick("student")}
          className={activeTab === "student" ? "active" : ""}
        >
          Student
        </button>
        <button
          onClick={() => handleTabClick("solution")}
          className={activeTab === "solution" ? "active" : ""}
        >
          Solution
        </button>
      </div>
      <div className="tab-content">
        {activeTab === "student" && studentContent && (
          <div>
            {/* Render content for the student tab */}
            {/* <pre>{studentContent}</pre> */}
            <DocumentEditor
            id="docxEditor"
            documentServerUrl="http://192.168.1.125:8050"
            config={studentContent}
            events_onRequestSaveAs={(event) => {
              console.log("event = ", event);
              //  setSaveAsEvent(event); // Update the event state
              // savecopyAs(event);
            }}
          />
          </div>
        )}
        {activeTab === "solution" && solutionContent && (
          <div>
            {/* Render content for the solution tab */}
            {/* <pre>{solutionContent}</pre> */}
            <DocumentEditor
            id="docxEditor"
            documentServerUrl="http://192.168.1.125:8050"
            config={solutionContent}
          />
          </div>
        )}
      </div>
    </div>
  );
};

const TabContent1 = () => {
  return (
    <div>
      <h2>Tab 1 Content</h2>
      {/* Add your content for Tab 1 here */}
    </div>
  );
};

const TabContent2 = () => {
  return (
    <div>
      <h2>Tab 2 Content</h2>
      {/* Add your content for Tab 2 here */}
    </div>
  );
};

export default TabComponent;
