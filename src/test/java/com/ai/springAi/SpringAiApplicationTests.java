package com.ai.springAi;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class SpringAiApplicationTests {

	@Autowired
	private RecipeService recipeService;

	@Autowired
	private ChatService chatService;

	@Test
	void contextLoads() {
	}

	@Test
	void testRecipeGenerationWithGroq() {
		String recipe = recipeService.createRecipe("pasta, tomatoes, basil, garlic", "Italian", "none");
		System.out.println("=== LIVE RECIPE RESPONSE ===");
		System.out.println(recipe);
		System.out.println("============================");

		assertNotNull(recipe, "Recipe should not be null");
		assertFalse(recipe.contains("Pan-Seared Medley"), "Recipe should not be the static fallback recipe");
	}

	@Test
	void testChatResponseWithGroq() {
		String chatResponse = chatService.getResponse("Say 'Spring AI is working!' in one sentence.");
		System.out.println("=== LIVE CHAT RESPONSE ===");
		System.out.println(chatResponse);
		System.out.println("==========================");

		assertNotNull(chatResponse, "Chat response should not be null");
		assertFalse(chatResponse.contains("Notice: AI provider reported"), "Chat response should not contain error notices");
	}

}
