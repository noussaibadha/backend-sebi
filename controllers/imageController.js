const axios = require("axios");

// Fonction pour générer une image
const generateLeonardoImage = async (req, res) => {
  const { userName, game, level, character } = req.body;

  try {
   const prompt = `Une scène magique pour enfants mettant en scène une gazelle nommée Sebi (pelage doré, yeux doux, air joueur) et son ami l’écureuil Drys (petit, roux, malicieux), fêtant leur victoire dans le jeu ${game}, avec des couleurs vives et un style de dessin animé.`;


    const response = await axios.post(
      "https://cloud.leonardo.ai/api/rest/v1/generations",
      {
        prompt,
        modelId: "ac614f96-1082-45bf-be9d-757f2d31c174", // tu peux changer selon ton modèle
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
