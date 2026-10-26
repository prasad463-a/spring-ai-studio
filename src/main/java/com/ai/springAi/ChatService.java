package com.ai.springAi;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.ai.chat.prompt.Prompt;

@Service
public class ChatService {

    private final ChatModel chatModel;
    
    public ChatService(
            @Qualifier("openAiChatModel") ChatModel chatModel) {
        this.chatModel = chatModel;
    }
    
    public String getResponse(String prompt) {
        try {
            return chatModel.call(prompt);
        } catch (Exception e) {
            System.err.println("ChatModel getResponse error: " + e.getMessage());
            return "I received your message: \"" + prompt + "\". Notice: AI provider reported (" + e.getMessage() + "). Please verify your API key in application.properties.";
        }
    }

    public String getResponseOption(String prompt) {
        try {
            ChatResponse response = chatModel.call(
                    new Prompt(
                        prompt,
                        OpenAiChatOptions.builder()
                            .model("openai/gpt-oss-120b")
                            .temperature(0.4)
                        .build()
                    ));
            return response.getResult().getOutput().getText();
        } catch (Exception e) {
            System.err.println("ChatModel getResponseOption error: " + e.getMessage());
            return "Prompt received: \"" + prompt + "\" (with options). Notice: AI provider reported (" + e.getMessage() + "). Please verify your API key in application.properties.";
        }
    }
}
