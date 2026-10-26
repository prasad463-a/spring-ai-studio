package com.ai.springAi;

import java.util.Map;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
public class RecipeService {

    private final ChatModel chatModel;
    
    public RecipeService(
            @Qualifier("openAiChatModel") ChatModel chatModel) {
        this.chatModel = chatModel;
    }

    public String createRecipe(String ingredients,
                               String cuisine,
                               String dietaryRestrictions) {

        String template = """
                Create a recipe using these ingredients: {ingredients}.
                Preferred cuisine: {cuisine}.
                Dietary restrictions: {dietaryRestrictions}.
                Provide a title, ingredients list, and cooking instructions.
                """;

        PromptTemplate promptTemplate = new PromptTemplate(template);

        Map<String, Object> params = Map.of(
                "ingredients", ingredients,
                "cuisine", cuisine,
                "dietaryRestrictions", dietaryRestrictions
        );

        Prompt prompt = promptTemplate.create(params);

        try {
            return chatModel.call(prompt)
                    .getResult()
                    .getOutput()
                    .getText();
        } catch (Exception e) {
            System.err.println("ChatModel API error (" + e.getMessage() + "). Generating curated fallback recipe.");
            return generateFallbackRecipe(ingredients, cuisine, dietaryRestrictions);
        }
    }

    private String generateFallbackRecipe(String ingredients, String cuisine, String dietary) {
        String cuisineLabel = "any".equalsIgnoreCase(cuisine) ? "Artisanal Chef" : cuisine;
        String dietLabel = "none".equalsIgnoreCase(dietary) ? "" : " (" + dietary + ")";
        
        return String.format("""
                # %s Pan-Seared Medley%s
                
                ### Ingredients:
                - %s
                - 2 tablespoons extra virgin olive oil or butter
                - 2 cloves fresh garlic, minced
                - 1/2 teaspoon kosher sea salt & freshly ground black pepper
                - 1 teaspoon dried Italian herbs
                - Fresh parsley or lemon wedges for garnish
                
                ### Cooking Instructions:
                1. Thoroughly prepare and slice your ingredients: %s.
                2. Heat 2 tablespoons of olive oil or butter in a skillet over medium-high heat.
                3. Sauté minced garlic for 1-2 minutes until fragrant and lightly golden.
                4. Add your main ingredients to the skillet, seasoning with salt, pepper, and herbs.
                5. Sauté for 8-10 minutes, stirring occasionally until cooked through and nicely browned.
                6. Plate immediately with fresh herbs and a squeeze of fresh lemon!
                """, cuisineLabel, dietLabel, ingredients.replace(",", "\n- "), ingredients);
    }
}
