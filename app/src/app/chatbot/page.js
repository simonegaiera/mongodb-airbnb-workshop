'use client';
import React, { useState, useEffect } from 'react';
import Chatbot, {
  FloatingActionButtonTrigger,
  InputBarTrigger,
  ModalView,
  MongoDbLegalDisclosure,
  mongoDbVerifyInformationMessage,
} from "mongodb-chatbot-ui";

export default function Home() {
  const [username, setUsername] = useState('Stays');

  useEffect(() => {
    fetch(`${process.env.BASE_URL}/api/results/whoami`)
      .then(res => res.json())
      .then(data => setUsername(data.name))
      .catch(() => {/* fallback */});
  }, []);

  const suggestedPrompts = ["Best view in hawaii?"];

  return (
    <div>
      <Chatbot
        name="MongoDB AI"
        maxInputCharacters={300}
        getClientContext={() => ({
          userId: username,
          preferredLanguage: "JavaScript"
        })}
        messageStream={({ message, history, clientContext, signal }) =>
          fetch(`${process.env.BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history, clientContext }),
            signal
          }).then(res => res.body)
        }
      >
        <InputBarTrigger
          bottomContent={<MongoDbLegalDisclosure />}
          suggestedPrompts={suggestedPrompts}
        />
        <FloatingActionButtonTrigger text="Ask My MongoDB AI" />
        <ModalView
          disclaimer={<MongoDbLegalDisclosure />}
          initialMessageText="Welcome… What can I help you with?"
          initialMessageSuggestedPrompts={suggestedPrompts}
          inputBottomText={mongoDbVerifyInformationMessage}
        />
      </Chatbot>
    </div>
  );
}