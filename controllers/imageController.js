const axios = require("axios");

// Fonction pour générer une image

const generateLeonardoImage = async (req, res) => {
  const { userName, game, level, character } = req.body;

  try {
    let prompt;

    if (character === "Drys") {
      prompt = `Cartoon-style reward image featuring Drys, a cute red squirrel with big shiny eyes and curly dark brown hair, standing upright with a proud smile. Next to him is Sebi, a shiny orange baby gazelle with small horns, big glowing eyes, and white markings. They are in a magical forest full of sparkles, floating stars, and colorful confetti. A big golden trophy with a star on it hovers above them. The style is vibrant 3D illustration, ultra-cute, smooth and glossy textures, inspired by mobile game character art, soft lighting, kid-friendly, like modern animated characters from a children's game or app.`;
    } else if (character === "James") {
      prompt = `A cheerful cartoon-style victory scene with James, a wise and friendly owl with glasses, a mustache, a tuxedo and well-groomed brown hair, standing next to Sebi, an adorable orange baby gazelle with shiny eyes, small horns, and white markings. They are in a magical clearing filled with colorful balloons, floating golden stars, and confetti. A large shiny golden medal with a star is floating above them. The style is ultra-cute 3D cartoon, smooth textures, glossy lighting, bright colors, Pixar-inspired, for a children's mobile game. Both characters are smiling and proud, celebrating a victory together.`;
    } else {
      prompt = `Une scène fantastique pour enfants avec des personnages félicitant un joueur après avoir gagné au jeu ${game}, ambiance magique et joyeuse.`;
    }

    const response = await axios.post(
      "https://cloud.leonardo.ai/api/rest/v1/generations",
      {
        prompt,
        modelId: "ac614f96-1082-45bf-be9d-757f2d31c174",
        num_images: 1,
        width: 512,
        height: 512,
        guidance_scale: 7,
        promptMagic: true,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const generationId = response.data.sdGenerationJob.generationId;
    res.status(200).json({ generationId });
  } catch (error) {
    console.error("❌ Erreur lors de la génération :", error?.response?.data || error.message);
    res.status(500).json({ error: "Échec génération image IA" });
  }
};
// Fonction pour récupérer l'image générée
const getLeonardoImage = async (req, res) => {
  const { generationId } = req.params;

  try {
    const response = await axios.get(
      `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
        },
      }
    );

    const imageUrl = response.data.generations_by_pk?.generated_images?.[0]?.url;

    if (imageUrl) {
      res.status(200).json({ imageUrl }); // ⛔ ça retourne juste le lien Leonardo (et pas un fichier local)
    }
else {
      res.status(404).json({ error: "Image non trouvée (encore en génération ?)" });
    }
  } catch (error) {
    console.error("❌ Erreur récupération image :", error?.response?.data || error.message);
    res.status(500).json({ error: "Échec récupération image IA" });
  }
};

module.exports = { generateLeonardoImage, getLeonardoImage };
