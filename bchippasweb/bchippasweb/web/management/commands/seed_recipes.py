from django.core.management.base import BaseCommand
from web.models import Product, Recipe


# Recipes mapped by product slug
RECIPE_DATA = {
    # ─── SNACKS ───────────────────────────────────────────────
    "banana-chips-classic": [
        {
            "title": "Banana Chips Chaat",
            "description": "A tangy, spicy twist on classic banana chips — tossed with onions, tomatoes, and chutneys for a quick party snack.",
            "ingredients": "1 cup Bichippas Banana Chips\n½ cup finely chopped onions\n½ cup finely chopped tomatoes\n2 tbsp green chutney\n1 tbsp tamarind chutney\n1 tsp chaat masala\nFresh coriander leaves\nSev for topping",
            "instructions": "Crush banana chips into bite-sized pieces in a bowl.\nAdd chopped onions and tomatoes.\nDrizzle green chutney and tamarind chutney.\nSprinkle chaat masala and toss gently.\nGarnish with coriander leaves and sev.\nServe immediately for maximum crunch.",
            "prep_time": "10 min",
            "cook_time": "0 min",
            "servings": "2-3",
        },
        {
            "title": "Banana Chips Trail Mix",
            "description": "A wholesome trail mix combining the crunch of banana chips with roasted nuts, seeds, and dried fruit — perfect for on-the-go snacking.",
            "ingredients": "1 cup Bichippas Banana Chips\n½ cup roasted cashews\n¼ cup roasted almonds\n¼ cup pumpkin seeds\n¼ cup dried cranberries\n¼ cup raisins\n½ tsp black salt\n¼ tsp red chilli powder",
            "instructions": "Break banana chips into halves.\nCombine with cashews, almonds, and pumpkin seeds.\nAdd dried cranberries and raisins.\nSprinkle black salt and chilli powder.\nToss well and store in an airtight container.\nPerfect as a travel or office snack.",
            "prep_time": "5 min",
            "cook_time": "0 min",
            "servings": "4-5",
        },
        {
            "title": "Banana Chips Nachos",
            "description": "Use banana chips as a desi alternative to nachos, topped with spiced beans, cheese, and fresh salsa.",
            "ingredients": "2 cups Bichippas Banana Chips\n1 cup boiled rajma (kidney beans)\n½ cup grated cheese\n½ cup diced tomatoes\n¼ cup diced onions\n1 green chilli, finely chopped\n1 tbsp lime juice\n1 tsp cumin powder\nFresh coriander for garnish",
            "instructions": "Spread banana chips on an oven-safe plate.\nMix rajma with cumin powder and a pinch of salt.\nSpoon the rajma mixture over the chips.\nSprinkle grated cheese generously.\nBake at 180°C for 5 minutes until the cheese melts.\nTop with diced tomatoes, onions, green chilli, and lime juice.\nGarnish with fresh coriander and serve hot.",
            "prep_time": "10 min",
            "cook_time": "5 min",
            "servings": "3-4",
        },
    ],
    "spicy-mixture": [
        {
            "title": "Mixture Bhel Puri",
            "description": "Transform spicy mixture into a flavourful bhel puri with puffed rice, tangy chutneys, and fresh vegetables.",
            "ingredients": "1 cup Bichippas Spicy Mixture\n1 cup puffed rice (murmura)\n½ cup finely chopped onions\n¼ cup finely chopped raw mango\n2 tbsp tamarind chutney\n1 tbsp green chutney\n1 tsp chaat masala\nFresh coriander leaves\nLemon wedges",
            "instructions": "Combine puffed rice and spicy mixture in a bowl.\nAdd chopped onions and raw mango.\nDrizzle tamarind and green chutney.\nSprinkle chaat masala and toss.\nGarnish with coriander and squeeze lemon.\nServe immediately.",
            "prep_time": "10 min",
            "cook_time": "0 min",
            "servings": "2-3",
        },
        {
            "title": "Spicy Mixture Crusted Paneer",
            "description": "A creative fusion dish where paneer cubes are coated in crushed spicy mixture for an extra crunchy, flavour-packed appetiser.",
            "ingredients": "200g paneer, cut into cubes\n1 cup Bichippas Spicy Mixture, finely crushed\n2 tbsp all-purpose flour\n1 egg (or 2 tbsp besan batter for veg)\n¼ tsp turmeric\nSalt to taste\nOil for shallow frying\nMint chutney for serving",
            "instructions": "Lightly season paneer cubes with salt and turmeric.\nDip each cube in flour, then the egg or besan batter.\nRoll generously in crushed spicy mixture.\nShallow fry in hot oil until golden on all sides.\nDrain on paper towels.\nServe hot with mint chutney.",
            "prep_time": "15 min",
            "cook_time": "10 min",
            "servings": "3-4",
        },
    ],
    "tapioca-chips": [
        {
            "title": "Tapioca Chips with Coconut Chutney Dip",
            "description": "Elevate crispy tapioca chips with a creamy, aromatic coconut chutney dip — a classic Kerala combination.",
            "ingredients": "1 cup Bichippas Tapioca Chips\n1 cup freshly grated coconut\n2 green chillies\n1 small piece ginger\n½ cup roasted chana dal\n1 tbsp coconut oil\n1 sprig curry leaves\n1 tsp mustard seeds\nSalt to taste",
            "instructions": "Blend coconut, green chillies, ginger, chana dal, and salt to a smooth paste.\nHeat coconut oil in a small pan.\nAdd mustard seeds and let them splutter.\nAdd curry leaves and pour over the chutney.\nMix well and transfer to a serving bowl.\nArrange tapioca chips around the dip and serve.",
            "prep_time": "10 min",
            "cook_time": "5 min",
            "servings": "2-3",
        },
        {
            "title": "Tapioca Chips Upma",
            "description": "A quick and tasty upma made by sautéing crushed tapioca chips with onions, curry leaves, and mustard — a unique Kerala breakfast twist.",
            "ingredients": "2 cups Bichippas Tapioca Chips, lightly crushed\n1 medium onion, chopped\n2 green chillies, slit\n1 sprig curry leaves\n1 tsp mustard seeds\n1 tsp urad dal\n2 tbsp coconut oil\n¼ cup grated coconut\nSalt to taste\nWater as needed",
            "instructions": "Heat coconut oil in a pan.\nAdd mustard seeds and urad dal; let them splutter.\nAdd curry leaves, green chillies, and chopped onions.\nSauté until onions turn translucent.\nAdd crushed tapioca chips and sprinkle a little water.\nStir gently, cover and cook for 2 minutes.\nGarnish with grated coconut and serve warm.",
            "prep_time": "5 min",
            "cook_time": "10 min",
            "servings": "2-3",
        },
    ],
    "jackfruit-chips": [
        {
            "title": "Jackfruit Chips Salad Bowl",
            "description": "A vibrant salad bowl featuring crunchy jackfruit chips, crisp veggies, and a zesty lime dressing.",
            "ingredients": "1 cup Bichippas Jackfruit Chips\n1 cup mixed greens (lettuce, spinach)\n½ cup cherry tomatoes, halved\n½ cucumber, diced\n¼ cup grated carrot\n2 tbsp roasted peanuts\n2 tbsp olive oil\n1 tbsp lime juice\n½ tsp honey\nSalt and pepper to taste",
            "instructions": "Arrange mixed greens on a serving plate.\nTop with cherry tomatoes, cucumber, and grated carrot.\nWhisk olive oil, lime juice, honey, salt, and pepper.\nDrizzle the dressing over the salad.\nCrumble jackfruit chips on top for crunch.\nSprinkle roasted peanuts and serve fresh.",
            "prep_time": "10 min",
            "cook_time": "0 min",
            "servings": "2",
        },
        {
            "title": "Jackfruit Chips Raita",
            "description": "A refreshing raita with a twist — crushed jackfruit chips add a sweet, crunchy dimension to cool, spiced yoghurt.",
            "ingredients": "1 cup Bichippas Jackfruit Chips, coarsely crushed\n1 cup thick yoghurt\n¼ cup finely chopped cucumber\n1 tbsp chopped mint leaves\n½ tsp roasted cumin powder\n¼ tsp chaat masala\nSalt to taste\nA pinch of red chilli powder",
            "instructions": "Whisk yoghurt until smooth.\nFold in chopped cucumber and mint leaves.\nAdd roasted cumin powder, chaat masala, and salt.\nJust before serving, fold in crushed jackfruit chips.\nGarnish with a pinch of red chilli powder.\nServe chilled as a side with biryani or pulao.",
            "prep_time": "10 min",
            "cook_time": "0 min",
            "servings": "3-4",
        },
    ],
    "sweet-plantain-chips": [
        {
            "title": "Sweet Plantain Chips Parfait",
            "description": "A delightful layered parfait with jaggery-coated sweet plantain chips, yoghurt, and fresh fruits.",
            "ingredients": "1 cup Bichippas Sweet Plantain Chips\n1 cup Greek yoghurt\n½ cup diced mango\n½ cup diced banana\n2 tbsp honey\n2 tbsp granola\n1 tbsp chia seeds\nFresh mint for garnish",
            "instructions": "Layer yoghurt at the bottom of a glass.\nAdd a layer of diced mango and banana.\nCrumble sweet plantain chips over the fruits.\nDrizzle with honey.\nRepeat layers.\nTop with granola, chia seeds, and mint.\nServe immediately.",
            "prep_time": "10 min",
            "cook_time": "0 min",
            "servings": "2",
        },
        {
            "title": "Sweet Plantain Chips Ice Cream Sundae",
            "description": "An indulgent sundae where sweet plantain chips replace the wafer, paired with vanilla ice cream, jaggery sauce, and cashews.",
            "ingredients": "1 cup Bichippas Sweet Plantain Chips\n3 scoops vanilla ice cream\n2 tbsp melted jaggery\n1 tbsp warm honey\n2 tbsp crushed cashews\nWhipped cream\nChocolate shavings",
            "instructions": "Place scoops of vanilla ice cream in a serving bowl.\nArrange sweet plantain chips around and on top.\nDrizzle melted jaggery and warm honey.\nSprinkle crushed cashews.\nTop with a dollop of whipped cream.\nFinish with chocolate shavings and serve.",
            "prep_time": "5 min",
            "cook_time": "0 min",
            "servings": "1-2",
        },
    ],
    "kerala-murukku": [
        {
            "title": "Murukku Chaat",
            "description": "A crispy, tangy chaat that transforms Kerala murukku into an irresistible street-food-style snack.",
            "ingredients": "1 cup Bichippas Kerala Murukku, broken\n½ cup finely chopped onions\n½ cup finely chopped tomatoes\n1 tbsp tamarind chutney\n1 tbsp green chutney\n1 tsp chaat masala\n½ tsp red chilli powder\nCoriander leaves\nPomegranate seeds (optional)",
            "instructions": "Place broken murukku pieces in a serving bowl.\nTop with chopped onions and tomatoes.\nDrizzle tamarind and green chutney.\nSprinkle chaat masala and red chilli powder.\nGarnish with coriander and pomegranate seeds.\nToss gently and serve immediately.",
            "prep_time": "10 min",
            "cook_time": "0 min",
            "servings": "2-3",
        },
        {
            "title": "Murukku Crusted Fish Fry",
            "description": "An innovative fried fish recipe where crushed murukku creates an exceptionally crispy and flavourful coating.",
            "ingredients": "4 fish fillets (seer or king fish)\n1 cup Bichippas Kerala Murukku, finely crushed\n2 tbsp rice flour\n1 tsp red chilli powder\n½ tsp turmeric powder\n1 tbsp ginger-garlic paste\n1 tbsp lemon juice\nSalt to taste\nCoconut oil for frying",
            "instructions": "Marinate fish with ginger-garlic paste, chilli powder, turmeric, lemon juice, and salt for 20 minutes.\nMix crushed murukku with rice flour on a plate.\nCoat each marinated fish fillet in the murukku mixture.\nHeat coconut oil in a pan.\nShallow fry on medium heat until golden on both sides (about 4-5 min each side).\nDrain on paper towels and serve with lemon wedges.",
            "prep_time": "25 min",
            "cook_time": "10 min",
            "servings": "4",
        },
    ],
    # ─── SPICES ───────────────────────────────────────────────
    "chilli-powder": [
        {
            "title": "Kerala Chicken Fry (Nadan Kozhi Porichathu)",
            "description": "An iconic Kerala dish — fiery, aromatic chicken fried to perfection with Bichippas chilli powder and freshly ground spices.",
            "ingredients": "500g chicken, cut into pieces\n2 tbsp Bichippas Chilli Powder\n1 tsp turmeric powder\n1 tbsp ginger-garlic paste\n1 tsp pepper powder\n1 sprig curry leaves\n2 medium onions, sliced\n2 tbsp coconut oil\n1 tbsp lemon juice\nSalt to taste",
            "instructions": "Marinate chicken with chilli powder, turmeric, ginger-garlic paste, pepper, lemon juice, and salt for 30 minutes.\nHeat coconut oil in a heavy pan.\nAdd curry leaves and sliced onions; sauté until golden.\nAdd marinated chicken and cook on medium heat.\nStir occasionally until the chicken is cooked through and well browned.\nIncrease heat for the last 2 minutes for extra crispness.\nServe hot with Kerala parotta or rice.",
            "prep_time": "35 min",
            "cook_time": "25 min",
            "servings": "4",
        },
        {
            "title": "Chilli Powder Spiced Popcorn",
            "description": "Transform ordinary popcorn into a fiery, addictive snack with Bichippas chilli powder and butter.",
            "ingredients": "½ cup popcorn kernels\n2 tbsp butter, melted\n1 tsp Bichippas Chilli Powder\n½ tsp garlic powder\n½ tsp salt\n¼ tsp sugar\n1 tbsp coconut oil",
            "instructions": "Pop the kernels in coconut oil in a covered pot.\nMelt butter in a small bowl.\nMix chilli powder, garlic powder, salt, and sugar.\nDrizzle melted butter over the popcorn.\nSprinkle the chilli spice mix and toss well.\nServe warm as a movie night snack.",
            "prep_time": "5 min",
            "cook_time": "5 min",
            "servings": "3-4",
        },
    ],
    "turmeric-powder": [
        {
            "title": "Golden Turmeric Latte",
            "description": "A warm, healing golden milk made with Bichippas turmeric powder, fresh spices, and creamy milk — the ultimate wellness drink.",
            "ingredients": "1 cup whole milk (or oat milk)\n1 tsp Bichippas Turmeric Powder\n½ tsp cinnamon powder\n¼ tsp ginger powder\nA pinch of black pepper\n1 tsp honey or jaggery\n½ tsp coconut oil",
            "instructions": "Warm milk in a saucepan on low heat.\nAdd turmeric powder, cinnamon, ginger, and black pepper.\nWhisk well and let it simmer for 3-4 minutes.\nStir in coconut oil and honey.\nPour into a cup and dust with a little extra cinnamon.\nEnjoy warm before bedtime.",
            "prep_time": "2 min",
            "cook_time": "5 min",
            "servings": "1",
        },
        {
            "title": "Turmeric Rice (Manjal Choru)",
            "description": "A simple, comforting one-pot Kerala turmeric rice with coconut and mild spices — perfect for sick days or festive occasions.",
            "ingredients": "1 cup basmati rice, washed\n1 tsp Bichippas Turmeric Powder\n2 tbsp coconut oil\n1 tsp mustard seeds\n1 tsp cumin seeds\n10 cashews\n1 sprig curry leaves\n2 dried red chillies\n¼ cup grated coconut\n2 cups water\nSalt to taste",
            "instructions": "Heat coconut oil in a heavy pot.\nAdd mustard seeds, cumin seeds, dried red chillies, and cashews.\nWhen mustard splutters, add curry leaves.\nAdd washed rice and sauté for 1 minute.\nAdd turmeric powder, salt, and water.\nCover and cook on low heat until rice is fluffy (about 15 minutes).\nGarnish with grated coconut and serve with pickle and papad.",
            "prep_time": "10 min",
            "cook_time": "20 min",
            "servings": "3-4",
        },
    ],
    "coriander-powder": [
        {
            "title": "Kerala Vegetable Stew",
            "description": "A velvety coconut milk stew with vegetables, subtly spiced with Bichippas coriander powder — a staple with appam.",
            "ingredients": "1 cup mixed vegetables (carrot, beans, potato, peas)\n1 cup thick coconut milk\n½ cup thin coconut milk\n1 tbsp Bichippas Coriander Powder\n1 tsp whole black pepper\n4 cloves\n2 green cardamom pods\n1 cinnamon stick\n2 green chillies, slit\n1 medium onion, sliced\n1 sprig curry leaves\n2 tbsp coconut oil\nSalt to taste",
            "instructions": "Cook vegetables in thin coconut milk until tender.\nHeat coconut oil in a pan.\nAdd cloves, cardamom, cinnamon, and pepper; sauté briefly.\nAdd sliced onions, green chillies, and curry leaves.\nSauté until onions are soft.\nAdd coriander powder and stir.\nPour in the cooked vegetables with liquid.\nSimmer gently and add thick coconut milk.\nDo not boil after adding thick coconut milk.\nServe warm with appam or idiappam.",
            "prep_time": "15 min",
            "cook_time": "20 min",
            "servings": "4",
        },
        {
            "title": "Coriander Chicken Tikka",
            "description": "Juicy, smoky chicken tikka with a generous dose of Bichippas coriander powder for an earthy, aromatic flavour.",
            "ingredients": "500g boneless chicken, cubed\n1 tbsp Bichippas Coriander Powder\n½ cup thick yoghurt\n1 tbsp ginger-garlic paste\n1 tsp red chilli powder\n½ tsp turmeric powder\n1 tsp garam masala\n1 tbsp lemon juice\n2 tbsp mustard oil\nSalt to taste\nWooden skewers, soaked",
            "instructions": "Mix yoghurt with coriander powder, ginger-garlic paste, chilli powder, turmeric, garam masala, lemon juice, oil, and salt.\nMarinate chicken cubes in this mixture for at least 2 hours.\nThread onto soaked wooden skewers.\nGrill or bake at 220°C for 15-18 minutes, turning once.\nBaste with a little butter while grilling.\nServe with mint chutney and sliced onions.",
            "prep_time": "2 hrs 10 min",
            "cook_time": "18 min",
            "servings": "4",
        },
    ],
    "black-pepper-whole": [
        {
            "title": "Kerala Pepper Chicken (Kurumulaku Chicken)",
            "description": "A robust, dry-roasted chicken dish where freshly cracked Bichippas black pepper takes centre stage.",
            "ingredients": "500g chicken, bone-in pieces\n1 tbsp Bichippas Black Pepper, freshly cracked\n2 medium onions, finely sliced\n1 tbsp ginger-garlic paste\n1 sprig curry leaves\n½ tsp turmeric powder\n1 tsp garam masala\n3 tbsp coconut oil\n1 tomato, chopped\nSalt to taste",
            "instructions": "Marinate chicken with turmeric, half the pepper, ginger-garlic paste, and salt for 20 minutes.\nHeat coconut oil in a heavy pan (uruli if available).\nAdd curry leaves and sliced onions; cook until deep golden.\nAdd marinated chicken and sear on high heat.\nAdd chopped tomato and cook until oil separates.\nSprinkle remaining cracked pepper and garam masala.\nCook on medium heat until chicken is tender and dry-roasted.\nServe hot with steamed rice or parotta.",
            "prep_time": "25 min",
            "cook_time": "30 min",
            "servings": "4",
        },
        {
            "title": "Black Pepper Rasam",
            "description": "A soul-warming South Indian soup with Bichippas whole black pepper, tamarind, and tomato — perfect for rainy days.",
            "ingredients": "1 tbsp Bichippas Black Pepper Whole\n2 medium tomatoes, chopped\n1 small lemon-sized tamarind, soaked\n2 cloves garlic\n1 tsp cumin seeds\n½ tsp turmeric powder\n1 sprig curry leaves\n1 tsp mustard seeds\n2 dried red chillies\n2 tbsp ghee\nFresh coriander\nSalt to taste",
            "instructions": "Soak tamarind in warm water and extract juice.\nDry roast black pepper and cumin seeds; coarsely grind.\nBoil tamarind water with chopped tomatoes and turmeric.\nAdd the pepper-cumin powder and salt.\nSimmer for 10 minutes until flavours meld.\nHeat ghee, add mustard seeds, garlic, dried chillies, and curry leaves.\nPour the tempering over the rasam.\nGarnish with coriander and serve hot with rice.",
            "prep_time": "15 min",
            "cook_time": "15 min",
            "servings": "4",
        },
    ],
    "cardamom-pods": [
        {
            "title": "Cardamom Chai",
            "description": "The quintessential Indian masala chai, perfumed with Bichippas cardamom pods for an aromatic and invigorating brew.",
            "ingredients": "2 cups water\n1 cup milk\n2 tsp loose black tea (Assam or CTC)\n3 Bichippas Cardamom Pods, lightly crushed\n1 small cinnamon stick\n2 cloves\n1 thin slice ginger\n2 tsp sugar or jaggery",
            "instructions": "Boil water in a saucepan.\nAdd crushed cardamom pods, cinnamon, cloves, and ginger.\nSimmer for 2 minutes to release the aromas.\nAdd tea leaves and boil for 1 minute.\nPour in milk and bring to a rolling boil.\nAdd sugar, stir, and strain into cups.\nServe hot with biscuits or rusks.",
            "prep_time": "2 min",
            "cook_time": "8 min",
            "servings": "2",
        },
        {
            "title": "Elaneer Payasam (Cardamom Coconut Kheer)",
            "description": "A rich, festive Kerala payasam with tender coconut, cardamom, and condensed milk — a crowd favourite at Onam sadya.",
            "ingredients": "1 cup tender coconut flesh, chopped\n1 cup tender coconut water\n½ cup condensed milk\n¼ cup sugar\n4 Bichippas Cardamom Pods, powdered\n2 tbsp ghee\n10 cashews\n10 raisins\n1 cup milk",
            "instructions": "Heat ghee in a pan and fry cashews and raisins until golden; set aside.\nBlend half the tender coconut flesh with its water to a smooth paste.\nCombine the paste, remaining coconut pieces, milk, and condensed milk in a pot.\nAdd sugar and cardamom powder.\nCook on low heat for 10 minutes, stirring gently.\nDo not boil vigorously.\nGarnish with fried cashews and raisins.\nServe warm or chilled.",
            "prep_time": "15 min",
            "cook_time": "15 min",
            "servings": "4-6",
        },
    ],
    "garam-masala": [
        {
            "title": "Kerala Egg Roast",
            "description": "A fiery, rich egg curry with Bichippas Garam Masala — a beloved side for appam, porotta, and bread across Kerala.",
            "ingredients": "6 boiled eggs, halved\n2 large onions, finely sliced\n2 tomatoes, finely chopped\n1 tsp Bichippas Garam Masala\n1 tbsp chilli powder\n½ tsp turmeric powder\n1 tsp ginger-garlic paste\n1 sprig curry leaves\n3 tbsp coconut oil\nSalt to taste",
            "instructions": "Heat coconut oil and add curry leaves.\nAdd sliced onions and fry until deep brown.\nAdd ginger-garlic paste and sauté for a minute.\nAdd chilli powder, turmeric, and salt; cook for 2 minutes.\nAdd chopped tomatoes and cook until the masala thickens and oil separates.\nSprinkle garam masala and mix well.\nGently add halved boiled eggs and coat with the masala.\nSimmer for 5 minutes on low heat.\nServe hot with appam or parotta.",
            "prep_time": "15 min",
            "cook_time": "20 min",
            "servings": "3-4",
        },
        {
            "title": "Garam Masala Roasted Vegetables",
            "description": "Oven-roasted seasonal vegetables tossed with Bichippas Garam Masala, olive oil, and honey for a fragrant, caramelised side dish.",
            "ingredients": "2 cups mixed vegetables (sweet potato, cauliflower, bell peppers, zucchini)\n1 tsp Bichippas Garam Masala\n2 tbsp olive oil\n1 tbsp honey\n½ tsp salt\n¼ tsp pepper\n1 tbsp lemon juice\nFresh parsley or coriander",
            "instructions": "Preheat oven to 200°C.\nCut vegetables into even, bite-sized pieces.\nToss with olive oil, honey, garam masala, salt, and pepper.\nSpread in a single layer on a baking sheet.\nRoast for 25-30 minutes, tossing halfway, until golden and tender.\nSqueeze lemon juice over the top.\nGarnish with fresh herbs and serve.",
            "prep_time": "10 min",
            "cook_time": "30 min",
            "servings": "4",
        },
    ],
    # ─── PICKLES ──────────────────────────────────────────────
    "mango-pickle": [
        {
            "title": "Mango Pickle Fried Rice",
            "description": "A tangy, one-pot fried rice bursting with the bold flavours of Bichippas mango pickle, peanuts, and curry leaves.",
            "ingredients": "2 cups cooked rice (day-old preferred)\n2 tbsp Bichippas Mango Pickle, chopped\n1 tbsp pickle oil\n1 tsp mustard seeds\n1 sprig curry leaves\n10 peanuts\n1 medium onion, chopped\n2 green chillies, slit\n¼ tsp turmeric powder\nSalt to taste\nFresh coriander",
            "instructions": "Heat pickle oil in a wok or kadai.\nAdd mustard seeds and peanuts; let them splutter.\nAdd curry leaves, green chillies, and chopped onion.\nSauté until onions turn translucent.\nAdd turmeric and the chopped mango pickle.\nAdd cooked rice and toss on high heat for 3-4 minutes.\nAdjust salt and garnish with coriander.\nServe with raita or papad.",
            "prep_time": "10 min",
            "cook_time": "10 min",
            "servings": "2-3",
        },
        {
            "title": "Mango Pickle Paratha",
            "description": "Stuffed parathas with a spicy mango pickle filling — a deliciously tangy twist on classic Indian flatbread.",
            "ingredients": "2 cups whole wheat flour\n2 tbsp Bichippas Mango Pickle, finely chopped\n1 tbsp pickle oil\n½ tsp ajwain (carom seeds)\nSalt to taste\nWater for kneading\nGhee for cooking",
            "instructions": "Knead a soft dough with flour, salt, ajwain, pickle oil, and water.\nRest for 15 minutes.\nDivide into portions and roll each into a small disc.\nPlace a spoonful of chopped mango pickle in the centre.\nSeal and roll out gently into a paratha.\nCook on a hot tawa with ghee until golden on both sides.\nServe with yoghurt or a cup of tea.",
            "prep_time": "25 min",
            "cook_time": "15 min",
            "servings": "4",
        },
    ],
    "lemon-pickle": [
        {
            "title": "Lemon Pickle Rice",
            "description": "A quick, zesty rice dish made by mixing cooked rice with Bichippas lemon pickle and a simple tempering.",
            "ingredients": "2 cups cooked rice\n2 tbsp Bichippas Lemon Pickle, mashed\n1 tbsp sesame oil\n1 tsp mustard seeds\n1 tsp urad dal\n10 peanuts\n1 sprig curry leaves\n2 dried red chillies\n½ tsp turmeric powder\nSalt to taste",
            "instructions": "Heat sesame oil in a pan.\nAdd mustard seeds, urad dal, peanuts, and red chillies.\nWhen they splutter, add curry leaves.\nAdd turmeric and mashed lemon pickle.\nStir well for a minute.\nAdd cooked rice and mix thoroughly.\nAdjust salt and serve with papad and raita.",
            "prep_time": "5 min",
            "cook_time": "10 min",
            "servings": "2-3",
        },
        {
            "title": "Lemon Pickle Grilled Sandwich",
            "description": "A tangy twist on a grilled cheese — spread with Bichippas lemon pickle, cheese, and fresh veggies for a quick meal.",
            "ingredients": "4 bread slices\n2 tbsp Bichippas Lemon Pickle, finely chopped\n4 cheese slices\n½ cup sliced cucumber\n½ cup sliced onion rings\nButter for grilling\nFresh lettuce leaves",
            "instructions": "Butter one side of each bread slice.\nSpread a thin layer of lemon pickle on the unbuttered side.\nLayer lettuce, cucumber, onion, and cheese.\nTop with the second slice, butter side out.\nGrill on a sandwich press until golden and cheese is melted.\nCut diagonally and serve hot.",
            "prep_time": "5 min",
            "cook_time": "5 min",
            "servings": "2",
        },
    ],
    "garlic-pickle": [
        {
            "title": "Garlic Pickle Butter Naan",
            "description": "Soft, buttery naan brushed with a garlic pickle butter — a flavour explosion with every bite.",
            "ingredients": "4 ready-made naans\n2 tbsp Bichippas Garlic Pickle, finely mashed\n3 tbsp butter, softened\n1 tbsp chopped coriander\n½ tsp sesame seeds",
            "instructions": "Mix softened butter with mashed garlic pickle.\nWarm the naans on a tawa or in an oven.\nBrush generously with the garlic pickle butter.\nSprinkle sesame seeds and coriander.\nFold and serve with dal or a curry of your choice.",
            "prep_time": "5 min",
            "cook_time": "5 min",
            "servings": "4",
        },
        {
            "title": "Garlic Pickle Pasta",
            "description": "An Indo-Italian fusion pasta tossed in a bold garlic pickle sauce with cherry tomatoes and fresh basil.",
            "ingredients": "200g penne pasta\n2 tbsp Bichippas Garlic Pickle\n1 tbsp olive oil\n1 cup cherry tomatoes, halved\n½ cup cream or coconut cream\n¼ tsp chilli flakes\nFresh basil\nParmesan cheese (optional)\nSalt to taste",
            "instructions": "Cook pasta until al dente; reserve ½ cup pasta water.\nHeat olive oil in a pan.\nAdd cherry tomatoes and cook until they soften.\nAdd garlic pickle and chilli flakes; stir for a minute.\nPour in cream and simmer gently.\nToss the cooked pasta in the sauce with a splash of pasta water.\nGarnish with fresh basil and Parmesan.\nServe immediately.",
            "prep_time": "10 min",
            "cook_time": "15 min",
            "servings": "2-3",
        },
    ],
    "mixed-veg-pickle": [
        {
            "title": "Mixed Veg Pickle Curd Rice",
            "description": "Cool, creamy curd rice topped with Bichippas mixed veg pickle for a tangy contrast — the ultimate South Indian comfort meal.",
            "ingredients": "2 cups cooked rice\n1 cup thick curd (yoghurt)\n½ cup milk\n2 tbsp Bichippas Mixed Veg Pickle\n1 tsp mustard seeds\n1 tsp urad dal\n1 sprig curry leaves\n1 green chilli, chopped\n1 tbsp coconut oil\nSalt to taste\nPomegranate seeds for garnish",
            "instructions": "Mash the cooked rice gently with a spoon.\nAdd curd and milk; mix until creamy.\nSeason with salt.\nHeat coconut oil, add mustard seeds, urad dal, curry leaves, and green chilli.\nPour the tempering over the curd rice.\nMix well and top each serving with a generous spoonful of mixed veg pickle.\nGarnish with pomegranate seeds and serve chilled.",
            "prep_time": "10 min",
            "cook_time": "5 min",
            "servings": "2-3",
        },
        {
            "title": "Mixed Pickle Quesadilla",
            "description": "A fusion quesadilla stuffed with Bichippas mixed veg pickle, melty cheese, and fresh avocado — bold meets familiar.",
            "ingredients": "4 flour tortillas\n3 tbsp Bichippas Mixed Veg Pickle\n1 cup shredded mozzarella\n½ avocado, sliced\n¼ cup sliced jalapeños\nSour cream for serving\nButter for cooking",
            "instructions": "Spread a layer of mixed veg pickle on one tortilla.\nTop with shredded mozzarella, avocado slices, and jalapeños.\nPlace another tortilla on top.\nHeat butter in a pan and cook the quesadilla until golden on both sides.\nCut into wedges.\nServe with sour cream.",
            "prep_time": "5 min",
            "cook_time": "8 min",
            "servings": "2",
        },
    ],
    "gooseberry-pickle": [
        {
            "title": "Gooseberry Pickle Pachadi",
            "description": "A cooling yet tangy side dish combining Bichippas gooseberry pickle with fresh coconut and yoghurt — a sadya favourite.",
            "ingredients": "2 tbsp Bichippas Gooseberry Pickle\n1 cup thick yoghurt\n½ cup grated coconut\n1 green chilli\n1 tsp mustard seeds\n1 sprig curry leaves\n1 tbsp coconut oil\nSalt to taste",
            "instructions": "Grind grated coconut and green chilli to a smooth paste.\nMix the coconut paste with yoghurt.\nGently fold in the gooseberry pickle.\nHeat coconut oil, add mustard seeds and curry leaves.\nPour the tempering over the pachadi.\nMix gently and serve chilled as a side dish.\nPerfect with rice and sambar.",
            "prep_time": "10 min",
            "cook_time": "3 min",
            "servings": "3-4",
        },
        {
            "title": "Gooseberry Pickle Bruschetta",
            "description": "An Indian-inspired bruschetta with tangy gooseberry pickle, cream cheese, and fresh herbs on crispy toast.",
            "ingredients": "1 baguette, sliced diagonally\n3 tbsp Bichippas Gooseberry Pickle\n4 tbsp cream cheese\n1 tbsp olive oil\nFresh mint leaves\nCrushed black pepper\nA drizzle of honey",
            "instructions": "Brush baguette slices with olive oil.\nToast in oven at 180°C until crisp and golden.\nSpread cream cheese on each toast.\nTop with a teaspoon of gooseberry pickle.\nDrizzle with honey and sprinkle crushed pepper.\nGarnish with fresh mint.\nServe as an appetiser or party snack.",
            "prep_time": "10 min",
            "cook_time": "8 min",
            "servings": "4-6",
        },
    ],
    "tender-mango-pickle": [
        {
            "title": "Tender Mango Pickle Dal Tadka",
            "description": "A comforting dal tadka elevated with the zingy punch of Bichippas tender mango pickle — a perfect everyday meal.",
            "ingredients": "1 cup toor dal (split pigeon peas)\n2 tbsp Bichippas Tender Mango Pickle\n1 medium onion, chopped\n1 tomato, chopped\n1 tsp cumin seeds\n1 tsp mustard seeds\n2 cloves garlic, sliced\n1 sprig curry leaves\n½ tsp turmeric powder\n1 tsp red chilli powder\n2 tbsp ghee\nFresh coriander\nSalt to taste",
            "instructions": "Pressure cook dal with turmeric and water until soft.\nHeat ghee in a pan.\nAdd cumin seeds, mustard seeds, garlic, and curry leaves.\nAdd chopped onion and sauté until golden.\nAdd tomato, chilli powder, and salt; cook until soft.\nPour the cooked dal into the tempering.\nStir in tender mango pickle.\nSimmer for 5 minutes.\nGarnish with coriander and serve with steamed rice.",
            "prep_time": "10 min",
            "cook_time": "25 min",
            "servings": "3-4",
        },
        {
            "title": "Tender Mango Pickle Dosa Spread",
            "description": "A tangy, spicy spread made by blending Bichippas tender mango pickle with coconut — transforms a plain dosa into a gourmet treat.",
            "ingredients": "3 tbsp Bichippas Tender Mango Pickle\n½ cup freshly grated coconut\n1 green chilli\n1 small shallot\n½ tsp sesame oil\nSalt to taste\nDosa batter (for making dosas)",
            "instructions": "Blend tender mango pickle, coconut, green chilli, and shallot to a coarse paste.\nMix in sesame oil and salt.\nPrepare thin, crispy dosas.\nSpread the pickle-coconut mixture on the dosa while it is on the tawa.\nFold and serve hot with sambar.\nAlso works great as a spread on toast or crackers.",
            "prep_time": "10 min",
            "cook_time": "5 min",
            "servings": "2-3",
        },
    ],
    # ─── SWEETS ───────────────────────────────────────────────
    "sharkara-varatti": [
        {
            "title": "Sharkara Varatti Milkshake",
            "description": "A creamy, indulgent milkshake featuring the unique caramelised sweetness of Bichippas Sharkara Varatti and vanilla ice cream.",
            "ingredients": "1 cup Bichippas Sharkara Varatti\n2 scoops vanilla ice cream\n1 cup chilled milk\n2 tbsp honey\nA pinch of cardamom powder\nWhipped cream\nCrushed sharkara varatti for topping",
            "instructions": "Blend sharkara varatti, ice cream, milk, honey, and cardamom until smooth.\nPour into a tall glass.\nTop with whipped cream.\nGarnish with crushed sharkara varatti pieces.\nServe immediately with a straw.\nA perfect festive treat.",
            "prep_time": "5 min",
            "cook_time": "0 min",
            "servings": "2",
        },
        {
            "title": "Sharkara Varatti Payasam Bowl",
            "description": "A deconstructed payasam bowl with Bichippas Sharkara Varatti piled over thick, sweetened coconut milk and toasted coconut.",
            "ingredients": "1 cup Bichippas Sharkara Varatti\n1 cup thick coconut milk\n¼ cup jaggery, melted\n½ tsp cardamom powder\n2 tbsp ghee\n10 cashews\n2 tbsp toasted desiccated coconut",
            "instructions": "Warm coconut milk gently on low heat.\nStir in melted jaggery and cardamom powder.\nFry cashews in ghee until golden.\nPour the sweetened coconut milk into bowls.\nTop generously with sharkara varatti.\nSprinkle toasted coconut and fried cashews.\nServe warm as a dessert.",
            "prep_time": "5 min",
            "cook_time": "10 min",
            "servings": "2-3",
        },
    ],
    "achappam": [
        {
            "title": "Achappam Ice Cream Sandwich",
            "description": "A playful dessert sandwich using crispy Bichippas achappam as the shell, filled with a scoop of ice cream.",
            "ingredients": "6 pieces Bichippas Achappam\n3 scoops your favourite ice cream\n2 tbsp chocolate sauce\n1 tbsp crushed pistachios\nHoney for drizzling",
            "instructions": "Place one achappam flat on a plate.\nPlace a scoop of ice cream on top.\nGently press another achappam on top to form a sandwich.\nDrizzle with chocolate sauce and honey.\nSprinkle crushed pistachios.\nServe immediately before the achappam softens.",
            "prep_time": "5 min",
            "cook_time": "0 min",
            "servings": "3",
        },
        {
            "title": "Achappam Tres Leches Bites",
            "description": "A fusion dessert where achappam soaks up a three-milk mixture for a melt-in-your-mouth experience.",
            "ingredients": "8 pieces Bichippas Achappam\n½ cup condensed milk\n½ cup evaporated milk\n¼ cup coconut cream\n½ tsp vanilla extract\nWhipped cream\nCinnamon powder\nFresh strawberries for garnish",
            "instructions": "Mix condensed milk, evaporated milk, coconut cream, and vanilla.\nArrange achappam in a shallow dish.\nSlowly pour the milk mixture over the achappam.\nLet it soak for 5-10 minutes (not too long to keep some crunch).\nTop each piece with a swirl of whipped cream.\nDust with cinnamon and garnish with strawberry slices.\nServe chilled.",
            "prep_time": "15 min",
            "cook_time": "0 min",
            "servings": "4",
        },
    ],
    "kuzhalappam": [
        {
            "title": "Kuzhalappam Chaat Cups",
            "description": "Creative chaat cups using Bichippas kuzhalappam as edible crunchy shells filled with spiced yoghurt and chutneys.",
            "ingredients": "8 pieces Bichippas Kuzhalappam\n½ cup hung yoghurt\n¼ cup boiled chickpeas\n2 tbsp tamarind chutney\n1 tbsp green chutney\n1 tsp chaat masala\n¼ cup finely diced onion\nPomegranate seeds\nSev for topping",
            "instructions": "Stand kuzhalappam pieces upright (or break to form cups).\nFill each with a spoonful of hung yoghurt.\nTop with boiled chickpeas and diced onion.\nDrizzle tamarind and green chutney.\nSprinkle chaat masala.\nGarnish with pomegranate seeds and sev.\nServe immediately as party appetisers.",
            "prep_time": "10 min",
            "cook_time": "0 min",
            "servings": "4",
        },
        {
            "title": "Kuzhalappam Soup Sticks",
            "description": "Serve Bichippas kuzhalappam as elegant dipping sticks alongside a warm, spiced tomato soup.",
            "ingredients": "8 pieces Bichippas Kuzhalappam\n4 large tomatoes, quartered\n1 medium onion, chopped\n3 cloves garlic\n1 cup vegetable stock\n1 tsp cumin powder\n½ tsp black pepper\n1 tbsp butter\n2 tbsp cream\nFresh basil\nSalt to taste",
            "instructions": "Sauté onion and garlic in butter until soft.\nAdd quartered tomatoes and cook until pulpy.\nAdd vegetable stock, cumin, pepper, and salt.\nSimmer for 15 minutes.\nBlend until smooth and strain.\nStir in cream and adjust seasoning.\nPour into bowls and garnish with basil.\nServe with kuzhalappam sticks on the side for dipping.",
            "prep_time": "10 min",
            "cook_time": "20 min",
            "servings": "3-4",
        },
    ],
    "banana-halwa": [
        {
            "title": "Banana Halwa Stuffed Paratha",
            "description": "A sweet, decadent breakfast paratha stuffed with warm, gooey Bichippas banana halwa — a festive morning treat.",
            "ingredients": "2 cups whole wheat flour\n½ cup Bichippas Banana Halwa\n2 tbsp ghee (for cooking)\n¼ tsp cardamom powder\nWater for kneading\nA pinch of salt",
            "instructions": "Knead a soft dough with flour, salt, and water; rest 15 minutes.\nMix banana halwa with cardamom powder.\nDivide dough into balls and roll into small discs.\nPlace a spoonful of halwa in the centre.\nSeal the edges and roll gently into a paratha.\nCook on a tawa with ghee until golden on both sides.\nServe hot with a glass of cold milk.",
            "prep_time": "20 min",
            "cook_time": "15 min",
            "servings": "4",
        },
        {
            "title": "Banana Halwa Modak",
            "description": "Ganesh Chaturthi special modaks with a luscious Bichippas banana halwa filling wrapped in a soft rice flour shell.",
            "ingredients": "1 cup rice flour\n1 cup water\n½ tsp salt\n1 tsp coconut oil\n¾ cup Bichippas Banana Halwa\n2 tbsp grated coconut\n¼ tsp cardamom powder\n1 tbsp crushed cashews",
            "instructions": "Boil water with salt and coconut oil.\nAdd rice flour, stir quickly, cover, and cook for 2 minutes.\nKnead into a smooth, pliable dough while warm.\nMix banana halwa with grated coconut, cardamom, and cashews.\nMake small cups from the dough, fill with halwa mixture.\nShape into modaks by pinching the edges closed.\nSteam for 10-12 minutes.\nServe warm with a drizzle of ghee.",
            "prep_time": "20 min",
            "cook_time": "15 min",
            "servings": "6-8",
        },
    ],
    "peanut-chikki": [
        {
            "title": "Peanut Chikki Granola Bars",
            "description": "Homemade granola bars using crushed Bichippas peanut chikki, oats, and honey — nutritious and irresistibly crunchy.",
            "ingredients": "1 cup Bichippas Peanut Chikki, coarsely crushed\n1 cup rolled oats\n¼ cup mixed seeds (sunflower, pumpkin)\n¼ cup dried cranberries\n3 tbsp honey\n2 tbsp peanut butter\n1 tbsp coconut oil\nA pinch of salt",
            "instructions": "Preheat oven to 170°C.\nToast oats and seeds in a dry pan for 3 minutes.\nWarm honey, peanut butter, and coconut oil together.\nMix oats, seeds, crushed chikki, cranberries, and salt.\nPour the warm honey mixture over and combine.\nPress firmly into a lined baking tray.\nBake for 20 minutes until golden.\nCool completely before cutting into bars.",
            "prep_time": "10 min",
            "cook_time": "25 min",
            "servings": "8-10",
        },
        {
            "title": "Peanut Chikki Milkshake",
            "description": "A protein-rich milkshake blending Bichippas peanut chikki with banana, milk, and a touch of cocoa.",
            "ingredients": "½ cup Bichippas Peanut Chikki, broken\n1 ripe banana\n1 cup chilled milk\n1 tbsp cocoa powder\n1 scoop vanilla ice cream\n1 tsp honey (optional)\nWhipped cream for topping",
            "instructions": "Add chikki pieces, banana, milk, cocoa powder, and ice cream to a blender.\nBlend until smooth.\nTaste and add honey if needed.\nPour into a tall glass.\nTop with whipped cream and a few chikki crumbles.\nServe chilled.",
            "prep_time": "5 min",
            "cook_time": "0 min",
            "servings": "1-2",
        },
    ],
    "sesame-balls": [
        {
            "title": "Sesame Balls Sundal Mix",
            "description": "A crunchy, nutritious sundal-style snack with crushed Bichippas sesame balls, boiled chickpeas, and grated coconut.",
            "ingredients": "½ cup Bichippas Sesame Balls, coarsely crushed\n1 cup boiled chickpeas\n¼ cup grated coconut\n1 tsp mustard seeds\n1 sprig curry leaves\n2 dried red chillies\n1 tbsp coconut oil\nSalt to taste\nLemon juice to taste",
            "instructions": "Heat coconut oil in a pan.\nAdd mustard seeds, red chillies, and curry leaves.\nAdd boiled chickpeas and sauté for 2 minutes.\nAdd salt and a squeeze of lemon juice.\nFold in the crushed sesame balls and grated coconut.\nToss gently and serve as an evening snack.\nIdeal for Navratri festivities.",
            "prep_time": "5 min",
            "cook_time": "5 min",
            "servings": "2-3",
        },
        {
            "title": "Sesame Balls Smoothie Bowl",
            "description": "A vibrant smoothie bowl topped with Bichippas sesame balls for a crunchy, nutrient-dense breakfast.",
            "ingredients": "1 frozen banana\n½ cup frozen mixed berries\n½ cup yoghurt\n2 tbsp honey\n4 Bichippas Sesame Balls\nFresh fruits (kiwi, strawberry, blueberry)\n1 tbsp chia seeds\n1 tbsp granola",
            "instructions": "Blend frozen banana, berries, yoghurt, and honey until thick and smooth.\nPour into a bowl.\nSlice fresh fruits for topping.\nArrange sesame balls, sliced fruits, chia seeds, and granola on top.\nDrizzle with a little extra honey.\nEnjoy immediately.",
            "prep_time": "10 min",
            "cook_time": "0 min",
            "servings": "1",
        },
    ],
}


class Command(BaseCommand):
    help = "Seeds sample recipes for all products"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing recipes before seeding",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            count = Recipe.objects.count()
            Recipe.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Deleted {count} existing recipes."))

        created_count = 0
        skipped_count = 0

        for product in Product.objects.all():
            recipes = RECIPE_DATA.get(product.slug, [])
            if not recipes:
                self.stdout.write(
                    self.style.WARNING(f"  No recipe data for: {product.name} ({product.slug})")
                )
                continue

            for recipe_data in recipes:
                _, created = Recipe.objects.get_or_create(
                    product=product,
                    title=recipe_data["title"],
                    defaults={
                        "description": recipe_data.get("description", ""),
                        "ingredients": recipe_data["ingredients"],
                        "instructions": recipe_data["instructions"],
                        "prep_time": recipe_data.get("prep_time"),
                        "cook_time": recipe_data.get("cook_time"),
                        "servings": recipe_data.get("servings"),
                    },
                )
                if created:
                    created_count += 1
                    self.stdout.write(f"  ✓ {product.name}: {recipe_data['title']}")
                else:
                    skipped_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone! Created {created_count} recipes, skipped {skipped_count} (already exist)."
            )
        )
