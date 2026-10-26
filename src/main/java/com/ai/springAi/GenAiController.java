package com.ai.springAi;

import java.io.IOException;
import java.util.List;

import org.springframework.ai.image.ImageResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;

@RestController
public class GenAiController {
     
	 private final ChatService chatservice;
	 private final ImageService imageservice;
	 private final RecipeService recipeService;
	

	public GenAiController(ChatService chatservice,ImageService imageservice,RecipeService recipeService) {
//		super();
		this.chatservice = chatservice;
		this.imageservice=imageservice;
		this.recipeService=recipeService;
	}
	
	@GetMapping("/ask-ai")
	public String getResponse(@RequestParam  String prompt) {
		return chatservice.getResponse(prompt);
	}
	@GetMapping("/ask-ai-options")
	public String getResponseOption(@RequestParam  String prompt) {
		return chatservice.getResponseOption(prompt);
	}
	@GetMapping("/generate-image")
	public void generateImage(HttpServletResponse response, @RequestParam  String prompt) throws IOException {
		ImageResponse imageresponse = imageservice.generateImage(prompt);
		String imgurl=imageresponse.getResult().getOutput().getUrl();
		response.sendRedirect(imgurl);
		
	}

@GetMapping("/recipe-creator")
public String recipeCreator(
        @RequestParam String ingredients,
        @RequestParam(defaultValue = "any") String cuisine,
        @RequestParam(defaultValue = "none") String dietaryRestrictions) {

    return recipeService.createRecipe(
            ingredients,
            cuisine,
            dietaryRestrictions
    );
}

}
