import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './styling/styles.css';
import 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import * as firebase from 'firebase';

import AceEditor from 'react-ace';
import { Button, Menu, MenuItem } from '@material-ui/core';

import Questions from './Questions';
import weeksproblem from './data/weeklyQuestions';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';

import MyVerticallyCenteredModal from './Modal';
import zayanbir from './images/zayanbir.png';

const firebaseConfig = {
  apiKey: 'AIzaSyBQLxaTvjqJKTLeNEae1J2ZeufVUpQfnLM',
  authDomain: 'cfp-code-submitter.firebaseapp.com',
  databaseURL: 'https://cfp-code-submitter.firebaseio.com',
  projectId: 'cfp-code-submitter',
  storageBucket: 'cfp-code-submitter.appspot.com',
  messagingSenderId: '483775167429',
  appId: '1:483775167429:web:6c0f89494372bc871829ac',
  measurementId: 'G-L6BZEQ6ZJ9',
};

try {
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
} catch {
  console.log('Failed to initialize app');
}

const db = firebase.firestore();
export default function Code({ name }) {
  const [code, setCode] = useState(
    `def main():
  pass
if __name__ == '__main__':
  main()`,
  );

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [anchorEl, setanchorEl] = useState(false);

  const [message, setMessage] = useState('Select Question to Submit');
  const { week } = weeksproblem[0];
  const recordButtonPosition = (event) => {
    console.log(event.currentTarget);
    setanchorEl(event.currentTarget);
  };

  const [modalShow, setModalShow] = useState(false);
  return (
    <div>
      <Questions questions={weeksproblem} className="currentQs" />

      <form className="codeSubmission">

        <div className="selectProblem">
          <Button aria-controls="simple-menu" aria-haspopup="true" onClick={recordButtonPosition}>
            {message}
          </Button>
          <Menu
            className="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => setanchorEl(false)}
          >
            {
              weeksproblem.map((item) => (
                <div>
                  <MenuItem onClick={(event) => {
                    setSelectedQuestion(event.nativeEvent.target.outerText);
                    setMessage(event.nativeEvent.target.outerText);
                    setanchorEl(false);
                  }}
                  >
                    {
                      item.qName
                    }
                  </MenuItem>
                </div>
              ))
            }
          </Menu>
        </div>
        <AceEditor
          className="theEditor"
          placeholder="Insert your Python code"
          mode="python"
          theme="monokai"
          name="blah2"
          onChange={(codeTyped) => setCode(codeTyped)}
          fontSize={20}
          showPrintMargin="true"
          showGutter="true"
          highlightActiveLine="true"
          value={code}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: false,
            showLineNumbers: true,
            tabSize: 2,
          }}
        />

        <MyVerticallyCenteredModal
          show={modalShow}
          onHide={() => setModalShow(false)}
          nameOfQuestion={selectedQuestion}
          code={code}
        />

        <button
          type="button"
          className="send-button"
          onClick={() => {
            console.log('I am clicked');
            try {
              db.collection(name).doc(selectedQuestion).set({
                code: code != null ? code : null,
                nameOfQuestion: selectedQuestion != null ? selectedQuestion : null,
                dateSubmitted: firebase.firestore.FieldValue.serverTimestamp(),
                week,
                grade: 0,
              })
                .then(() => {
                  setModalShow(true);
                })
                .catch((error) => {
                  alert('Error sending, please contact Hatem', error);
                });
            } catch (FirebaseError) {
              alert('Please select a question to submit');
            }
          }}
        >
          Send Code
        </button>
      </form>
    </div>
  );
}
Code.defaultProps = {
  name: '',
};

Code.propTypes = {
  name: PropTypes.string,
};
