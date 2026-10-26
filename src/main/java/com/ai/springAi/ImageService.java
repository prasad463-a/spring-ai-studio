package com.ai.springAi;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.ai.image.Image;
import org.springframework.ai.image.ImageGeneration;
import org.springframework.ai.image.ImageResponse;
import org.springframework.stereotype.Service;

@Service
public class ImageService {

    public ImageResponse generateImage(String prompt) {
        String encodedPrompt = URLEncoder.encode(prompt, StandardCharsets.UTF_8);
        String imageUrl = "https://image.pollinations.ai/prompt/" + encodedPrompt;

        Image image = new Image(imageUrl, null);
        ImageGeneration imageGeneration = new ImageGeneration(image);
        return new ImageResponse(List.of(imageGeneration));
    }
}
