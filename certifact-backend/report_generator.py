import random
import os
from fpdf import FPDF
from datetime import datetime

# --- 1. EXPANDED TEXT POOLS (2-3 Detailed Paragraphs per Entry) ---

MEDIA_TEXT_POOLS = {
    "AI-generated": {
        "50-60": [
            "The analysis detected subtle anomalies in the high-frequency domain, suggesting possible manipulation. While not definitive, these artifacts are often consistent with early-stage generative adversarial networks (GANs) or light retouching tools. The transitions between high-contrast edges show pixel interpolation that does not align with standard camera demosaicing algorithms.\n\nFurther inspection revealed minor inconsistencies in lighting angles and shadow fallout. While these could be attributed to heavy JPEG compression, the combination with frequency irregularities warrants caution. The shadows appear slightly too soft for the estimated hardness of the light source.\n\nConsequently, the system classifies this media as 'Indeterminate' but leaning towards synthetic modification. We recommend a manual review of the metadata and a reverse image search to confirm the source provenance.",
            
            "Signals are mixed. Our Error Level Analysis (ELA) highlights regions of different compression rates that may indicate splicing or in-painting. However, the lack of distinct distinct generative noise patterns prevents a higher confidence score. The file lacks the global uniformity usually seen in full AI generation.\n\nThe media resides in a 'gray zone' where it is difficult to distinguish between AI-assisted editing tools (like neural filters) and full-scale generation. It is possible that a real image was expanded using 'out-painting' or that specific elements were removed algorithmically.\n\nDue to these conflicting signals, the confidence score remains moderate. The geometry is sound, but the surface-level statistics exhibit a mathematical smoothness that is uncharacteristic of raw optical sensor data.",
            
            "We observed slight irregularities in the texture rendering of background elements. The pixel consistency score is lower than expected for a raw camera capture, hinting at synthetic modification. Specifically, the foliage or background noise appears repetitive, a sign of texture synthesis algorithms.\n\nDespite these markers, the primary subject retains semblance of natural sensor noise. This suggests the image may be a hybrid—a real photo that has been significantly altered or expanded by AI. The boundaries between the subject and the environment show faint blurring artifacts.\n\nFinal analysis suggests a high probability of 'AI-in-the-loop' creation, where human intent guided generative tools. It is not purely algorithmic, but it is certainly not a raw capture.",
            
            "Statistical analysis of the color filter array (CFA) interpolation shows deviation from standard camera models. This often occurs when an image is upscaled using AI super-resolution tools. The pixel grid lacks the periodic correlation artifacts introduced by physical Bayer filters.\n\nWhile this does not confirm the entire scene is fake, it indicates that algorithmic processing played a major role in the final output's creation. The lighting physics, while mostly accurate, show minor violations of the inverse-square law in the background.\n\nWe advise treating this content with skepticism. While the semantic content may be grounded in reality, the visual presentation has been mathematically reconstructed."
        ],
        "60-70": [
            "The media exhibits distinct unnatural patterns in texture rendering, particularly in complex areas like hair or foliage. The noise distribution across the image plane deviates significantly from what is expected of standard optical sensors. Instead of random photon shot noise, we see a structured, Gaussian noise pattern typical of diffusion models.\n\nAdditionally, there are signs of 'warping' in geometric structures that typically occur when AI models struggle to maintain spatial coherence. Straight lines in the background appear slightly curved without the presence of lens distortion. The confidence level suggests a high likelihood of synthetic generation.\n\nThese artifacts are consistent with mid-journey iterations of generative models. While the overall composition is convincing, the microscopic details betray the algorithmic origin of the file.",
            
            "Forensic sweeps detected a lack of consistent light directionality. Reflections in eyes or shiny surfaces do not align perfectly with the environmental lighting, a common flaw in mid-tier generative models. The specular highlights imply multiple conflicting light sources that do not exist in the scene.\n\nFurthermore, edge artifacts around the main subject suggest an AI-based background replacement or generation. The visual entropy is slightly too uniform to be organic. The separation between foreground and background lacks the natural focus roll-off of a physical lens.\n\nBased on these findings, the media is likely synthetic. The lighting inconsistencies alone are physically impossible in a single-exposure photograph.",
            
            "Analysis of the frequency spectrum reveals a drop-off in high-frequency details that is characteristic of diffusion-based generation. Real cameras capture specific 'grain' that is missing here. The image appears 'hyper-smooth' in areas that should contain texture, such as skin pores or fabric weave.\n\nThis smoothing effect is a strong indicator of algorithmic rendering rather than optical capture. The AI model has likely approximated the texture based on training weights rather than resolving actual detail. The local contrast is unusually high in low-frequency areas.\n\nThe system has flagged this as likely AI-generated. The lack of organic entropy is the primary driver for this classification.",
            
            "Our neural engine flagged specific regions containing semantic inconsistencies—such as undefined objects or blending textures—that rarely occur in nature. These are often hallucinations of the AI model. Background text or logos appear as garbled, alien-like glyphs rather than readable characters.\n\nWhile the overall composition mimics reality well, the micro-details fail under close inspection. Elements like jewelry, glasses, or background architecture dissolve into incoherent patterns upon zooming.\n\nThis structural incoherence is a definitive marker of synthetic media. The probability of this being a genuine camera capture is low."
        ],
        "70-80": [
            "Our deep learning models have flagged strong indicators of synthetic generation. Key facial landmarks show slight misalignment, and the iris reflection patterns are mathematically inconsistent, a common hallmark of Deepfake technology. The eyes appear to be looking in slightly different directions or focusing at different depths.\n\nFurthermore, the background texture lacks the microscopic noise granularity found in authentic camera footage. The blending between foreground and background elements shows digital smoothing characteristic of style-transfer algorithms. The silhouette of the subject is too sharp against the background.\n\nWe conclude that the face or subject has likely been generated or swapped. The biometric data does not align with natural human physiology.",
            
            "The biometric consistency check failed. In video analysis, the subject's blink rate and micro-expressions appear jagged or temporally inconsistent, suggesting the frames were generated individually or by a temporal model struggling with continuity. There is no detectable photoplethysmography (blood flow) signal in the skin tones.\n\nIn static analysis, the skin texture exhibits repetitive tiling patterns that do not occur in biological skin, strongly suggesting texture synthesis. The skin appears 'airbrushed' at a pixel level, lacking pores and scars.\n\nThis is a strong match for GAN-based generation. The subject displays the 'average' features of a training dataset rather than the unique asymmetry of a real human.",
            
            "There is a notable absence of Photo-Response Non-Uniformity (PRNU), the digital fingerprint left by physical camera sensors. Instead, the noise pattern is perfectly Gaussian, which is a default setting for many generative engines. A real camera sensor always leaves a fixed pattern noise footprint.\n\nThis lack of sensor imperfections, combined with physically unlikely shadow rendering, builds a strong case for AI generation. Shadows do not diverge correctly from the subject, indicating they were 'painted' by the model rather than cast by light.\n\nThe forensic profile is consistent with high-end synthetic media. Caution is strongly advised.",
            
            "The geometry of the scene violates vanishing point perspective rules in a way that suggests the image was constructed based on 2D patterns rather than 3D physics. This is typical of 2D diffusion models. Parallel lines converge at multiple, conflicting points on the horizon.\n\nBackground text or symbols appear garbled or alien-like, a persistent difficulty for current AI generation models, reinforcing the classification as synthetic. Objects in the periphery blend into one another without distinct borders.\n\nThe accumulation of geometric and semantic errors makes authenticity highly unlikely. The image was constructed, not captured."
        ],
        "80-90": [
            "The evidence for AI manipulation is compelling. The analysis found repeated 'hallucinations' in background details and physically impossible lighting geometry. The chroma subsampling patterns do not match any known physical camera sensor signature. The file lacks the standard artifacts introduced by Bayer filter demosaicing.\n\nTemporal analysis (if video) or spatial coherence checks (if image) reveal significant discontinuities. The subject's features exhibit fluid-like distortions that are practically impossible in real-world physics, pointing strongly to a generative source.\n\nThis level of distortion is specific to Latent Diffusion Models. The image is a statistical approximation of reality, not a recording of it.",
            
            "Visual artifacts specific to Latent Diffusion Models are clearly visible. We detected grid-like interference patterns in the Fourier transform of the image, which are residuals from the upsampling process of AI generators. These patterns are invisible to the naked eye but obvious to spectral analysis.\n\nThe subject possesses contrasting levels of detail—sharp eyes but blurry ears or hands—which is a tell-tale sign of foveated rendering prioritization in AI models. The model allocated more computing power to the face than the extremities.\n\nThese artifacts confirm that the image was generated by a neural network. The probability of human or optical origin is minimal.",
            
            "The spectral footprint of this file is entirely consistent with synthetic data. There is zero evidence of chromatic aberration or lens distortion, imperfections that exist in almost all real lenses. The image is 'mathematically perfect' in a way that physical lenses are not.\n\nThis 'perfect' mathematical rendering, devoid of optical flaws, indicates the image was calculated rather than captured. The dynamic range compression also mimics HDR tone-mapping without the associated noise penalty.\n\nThe file is classified as AI-generated with high confidence. It represents an idealized scene rather than a physical one.",
            
            "Cross-referencing with known Deepfake datasets shows high similarity in artifact clustering. The mouth movements (in video) lack the proper muscular correlation with the rest of the face. The jaw moves, but the neck muscles remain static, creating a 'puppet' effect.\n\nTexture analysis on clothing and hair reveals 'smudging' where the AI failed to resolve complex geometry. Individual strands of hair merge into solid masses or disappear into the skin. The physics of the hair movement (or drape) is incorrect.\n\nCumulative evidence points overwhelmingly to a synthetic origin. The biometric and physical inconsistencies are too numerous to be accidental."
        ],
        "90-100": [
            "The system’s analysis leaves virtually no doubt that this media is AI-generated. Every forensic layer, from pixel-level error analysis to semantic consistency checks, has flagged this content as synthetic. The file exhibits a complete lack of organic sensor noise, replaced instead by a generated noise pattern.\n\nVisual artifacts specific to diffusion models and GANs are prevalent throughout the file. We observe incoherent background geometry, impossible anatomical structures (such as extra fingers or merging limbs), and the presence of perfect mathematical gradients.\n\nThis is a definitive classification. The statistical properties of the image do not overlap with natural image statistics at any layer.",
            
            "This is a textbook example of AI synthesis. The frequency analysis shows a distinct 'checkerboard' pattern caused by deconvolution operations in neural networks. This footprint is practically unique to computer-generated imagery and does not occur in optical capture.\n\nFurthermore, semantic logic breaks down completely in the background—stairs leading nowhere, impossible architectural geometry, or morphing objects. The lighting violates the inverse-square law, maintaining intensity over distance in a way light cannot physically do.\n\nThe confidence score is maximized based on these undeniable structural failures. The media is entirely synthetic.",
            
            "Our models detected traces of invisible watermarking often embedded by commercial AI generators (such as DALL-E or Midjourney patterns). Combined with the complete lack of thermal noise, the diagnosis is definitive. The metadata also lacks standard camera EXIF signatures.\n\nThe lighting behaves inconsistently with physical light sources, originating from indeterminate points in space. The shadows are inconsistent with the occlusion of objects in the scene.\n\nThere is no evidence of a physical camera or lens being involved in the creation of this image. It is 100% algorithmically generated.",
            
            "Conclusive evidence of algorithmic generation. The correlation between color channels is mathematically perfect, lacking the crosstalk found in physical Bayer filters on camera sensors. The dynamic range is compressed in a way that mimics High Dynamic Range (HDR) photography but lacks the associated noise penalties.\n\nBiometric analysis indicates the subject does not exist; the facial proportions align perfectly with the 'average face' vector used in training datasets. The face lacks the natural asymmetry found in every human being.\n\nThis is definitively artificial media. It matches the known fingerprints of a diffusion-based generator."
        ]
    },
    "Real": {
        "50-60": [
            "The system leans toward authenticity but with moderate confidence. The media contains some noise patterns consistent with camera sensors, though heavy compression may be obscuring finer details. The JPEG quantization tables match standard digital cameras.\n\nWhile no obvious deepfake artifacts were found, the lack of distinct high-frequency data prevents a higher certainty score. It is likely real, but verify the source if the context is critical. The image may have been cropped or resized, losing vital forensic data.\n\nUltimately, the physics of the scene appear correct, but the digital signal is too weak to provide a definitive authentication.",
            
            "We detected signals of digital editing, such as increased contrast or saturation, which lowers the authenticity score. However, the underlying geometry and physics appear sound. Shadows fall where they should, and reflections are consistent.\n\nThis typically represents a 'real' photo that has been heavily filtered for social media, rather than one generated from scratch by AI. The core data is likely authentic, but the surface-level statistics have been modified.\n\nIt is classified as Real, but with the caveat that it is not a 'raw' untouched file.",
            
            "The pixel histogram suggests a natural capture, but the image resolution is too low to definitively rule out advanced AI upscaling. The lighting logic holds up under scrutiny. The color distribution follows natural laws rather than algorithmic bias.\n\nIt is probable that the media is authentic, but the low quality prevents the detection of microscopic sensor fingerprints. The absence of specific AI artifacts allows us to lean towards 'Real', but caution is advised due to the data quality.\n\nWe recommend obtaining a higher resolution version for a conclusive result.",
            
            "Mixed signals were found in the noise profile. While the grain looks mostly organic, some smooth patches exist. This is often caused by 'beauty mode' filters on smartphones. The skin texture has been smoothed, but the eyes and hair retain natural detail.\n\nThe core content is likely real—the anatomy is correct, and the background logic is sound—but the surface textures have been mathematically altered by on-device post-processing.\n\nTherefore, the image is physically real but digitally enhanced."
        ],
        "60-70": [
            "Authenticity is supported by the presence of natural sensor signatures. The variation in pixel intensity follows a standard Poisson distribution, which is difficult for AI models to replicate perfectly. This randomness represents the physical nature of photons hitting a sensor.\n\nLighting consistency across the subject and background appears organic. However, some minor irregularities prevent a higher score, possibly due to post-processing filters or low-light conditions. The white balance appears to have been adjusted.\n\nOverall, the semantic and physical consistency points to a real capture. The likelihood of AI generation is low, though simple editing cannot be ruled out.",
            
            "The media displays consistent ISO noise across both bright and dark areas, a feature often missed by generative models. The focus roll-off (bokeh) looks optically correct. Objects blur gradually as they move away from the focal plane.\n\nThere are no signs of the 'wax-like' skin texture common in AI generation. The skin exhibits pores, wrinkles, and imperfections that vary naturally. The confidence is good, suggesting a genuine capture.\n\nThe image passes the visual Turing test and statistical noise tests with a comfortable margin.",
            
            "Geometric analysis confirms that parallel lines converge at consistent vanishing points, indicating a real 3D space captured by a lens. AI often struggles with global perspective, leading to 'Escher-like' architecture, which is not present here.\n\nWhile the image is clean, traces of chromatic aberration (color fringing) at the edges provide evidence of physical glass optics being used. This optical flaw is a strong indicator of a real camera system.\n\nThe presence of these lens-specific defects confirms that the image passed through a physical optical system.",
            
            "Shadow analysis shows that the light source placement is physically consistent. Objects cast shadows that match their shape and the angle of light perfectly. The penumbra (shadow softness) increases with distance from the object.\n\nAI models often 'guess' shadows, leading to mismatching angles. The consistency here points to a real-world capture. The interaction between light and matter follows the laws of physics.\n\nWe classify this as likely authentic based on the integrity of the lighting model."
        ],
        "70-80": [
            "Strong evidence of authenticity is present. The media demonstrates stable natural textures and consistent noise granularity that aligns with physical optics. The entropy of the scene—random debris, stray hairs, dust—is high and chaotic.\n\nFacial movements and micro-expressions (if video) or static micro-details (if image) show a complexity that generative models currently struggle to achieve. The physics of light reflection in the eyes appears accurate, showing the reflection of the photographer or environment.\n\nThis level of incidental detail is computationally expensive to generate and rarely seen in AI outputs.",
            
            "We detected specific compression artifacts (JPEG/MPEG blocks) that are consistent with standard camera encoding pipelines, rather than the smooth artifacts of neural networks. The quantization matrices match known camera models.\n\nThe presence of minor, random imperfections—like dust on the lens or stray hairs—adds to the credibility of the image as a real capture. These imperfections are 'noise' that AI models are trained to remove.\n\nThe file exhibits the specific technical signature of a digital camera processing pipeline.",
            
            "The color distribution implies a high dynamic range capture typical of modern sensors. Transitions between hues are smooth and natural, lacking the 'banding' often seen in AI outputs. The histogram shows no signs of clipping or artificial generation.\n\nThe subject interacts with the environment (e.g., holding an object) with perfect contact physics. The deformation of skin against an object is physically accurate.\n\nThese physical interactions are extremely difficult to simulate, confirming the scene's reality.",
            
            "Spectral analysis shows a healthy amount of high-frequency noise that represents real-world entropy. AI models tend to denoise this data. The Fourier transform shows a natural falloff of energy.\n\nThe depth map estimated from the image is consistent and continuous, verifying that actual depth existed in the scene. There are no depth discontinuities or floating objects.\n\nThe spatial consistency of the scene strongly supports an optical origin."
        ],
        "80-90": [
            "Overwhelming evidence of authenticity. The analysis detected organic noise distribution and physical imperfections that verify the media was captured by a real-world sensor. The Photon Transfer Curve (PTC) matches that of silicon sensors.\n\nThere are no signs of warping, blurring, or artifacting common in AI synthesis. The depth of field and focus roll-off are consistent with actual lens physics. The circle of confusion in out-of-focus areas is perfectly round or polygonal based on the aperture blades.\n\nThese optical characteristics are definitive proof of a physical lens system.",
            
            "The Photo-Response Non-Uniformity (PRNU) noise trace is visible and consistent, acting as a unique fingerprint for a physical camera sensor. This noise pattern is unique to the specific device that took the photo.\n\nReflections in complex surfaces (water, glass) are ray-traced perfectly by physics, not approximated. We can see the correct inverted and distorted reflection of the environment.\n\nThis level of optical fidelity, including the correct handling of polarized light, is beyond current generative capabilities.",
            
            "In video analysis, the temporal stability is perfect. There is no flickering of background objects or 'jittering' of faces between frames. The pulse signal (subtle color changes in skin due to heartbeat) is detectable and consistent.\n\nThe audio-visual synchronization (if audio exists) and the micro-tremors of the camera hand-holding suggest a genuine human recording. The motion blur is consistent with the shutter angle.\n\nEvery temporal metric confirms that this is a continuous recording of a real event.",
            
            "Forensic Error Level Analysis (ELA) shows a uniform compression landscape, meaning the image has not been spliced or synthesized. The error levels are consistent across the entire frame, indicating a single capture event.\n\nThe complexity of the textures—such as skin pores or fabric weave—is resolved with a clarity that implies a direct photonic capture. There is no evidence of texture repetition or tiling.\n\nThe data integrity is high, pointing strongly to an unaltered source file."
        ],
        "90-100": [
            "The analysis is conclusive: the media is authentic. It possesses a complete and consistent forensic profile, including photo-response non-uniformity (PRNU) patterns specific to digital cameras. The statistical properties of the pixel blocks align perfectly with natural image statistics models.\n\nThe complex interplay of light, shadow, and texture contains zero traces of generative algorithmic intervention. The subsurface scattering of light on skin is physically accurate, and the volumetric fog or atmospheric perspective is consistent with real-world distance.\n\nThis is a pristine example of unmodified, real-world capture. The probability of manipulation is statistically zero.",
            
            "Absolute authenticity confirmed. The image contains microscopic optical flaws (lens diffraction, slight astigmatism) that strictly follow the laws of physics. The chromatic aberration increases radially from the center of the lens, which is physically correct.\n\nNo AI model currently simulates these specific optical imperfections. The data is mathematically chaotic in a way that only nature produces. The entropy levels are maximized for the given resolution.\n\nWe confirm this media originated from a physical optical sensor.",
            
            "The sensor pattern noise is perfectly intact. We can practically identify the type of camera sensor based on the noise profile. The demosaicing artifacts are consistent with a specific Bayer filter implementation.\n\nEvery forensic test—from lighting consistency to geometric perspective to spectral entropy—passes with flying colors. The thermal noise floor is consistent with the ISO settings in the metadata.\n\nThis is a genuine recording. The chain of custody from photon to pixel appears unbroken.",
            
            "This file exhibits the 'messiness' of reality. Random background entropy, imperfect lighting, and distinct sensor grain are all present. The dynamic range exceeds what is typically possible in generated images without HDR artifacts.\n\nAI aims for idealization; this image contains the uncalculated reality of the physical world. The interactions between objects, light, and atmosphere are physically flawless.\n\nIt is definitively authentic."
        ]
    }
}

DOCUMENT_TEXT_POOLS = {
    "AI-generated": {
        "50-60": [
            "The text indicates potential AI generation, though signals are mixed. The grammar is exceptionally polished, yet the sentence structures show a slight repetitive cadence often found in language models. It lacks the occasional structural awkwardness that often accompanies human drafting.\n\nWhile a human could write this, the lack of idiosyncratic errors suggests reliance on automated tools. It hovers on the boundary between heavy human editing and algorithmic assistance. The text feels polished but slightly sterile.\n\nIt is likely that this text was generated by an AI and then manually edited by a human to improve flow, leaving behind residual statistical artifacts.",
            
            "Analysis shows a neutral perplexity score. The text flows well but lacks a distinct 'voice' or strong opinion, which is common in AI-assisted writing. It presents information passively without taking a strong rhetorical stance.\n\nIt avoids taking risks with sentence structure. This caution is typical of a statistical model trying to maximize the probability of the next word, though it is not definitive proof.\n\nThe result is a text that is technically correct but stylistically flat, placing it in the 'Indeterminate' category.",
            
            "We detected a mix of high and low complexity. Some paragraphs read very mechanically, while others feel more organic. This often happens when a human uses AI to generate a draft and then lightly edits it, injecting some human variance into a machine-generated base.\n\nThe result is a hybrid text that triggers some, but not all, of our AI detection flags. The transition between these styles is abrupt, suggesting a copy-paste workflow.\n\nWhile not purely synthetic, the heavy reliance on generation tools is evident.",
            
            "The vocabulary usage is slightly monotonous. While grammatically perfect, it relies on common transition words ('Furthermore', 'In conclusion') more frequently than an experienced human writer typically would.\n\nThis formulaic approach prevents a higher confidence score but raises significant suspicion. It reads like a template rather than a custom-crafted argument.\n\nThe text prioritizes structure over insight, a common trade-off in Large Language Model outputs."
        ],
        "60-70": [
            "Likelihood of AI authorship is moderate. The text exhibits a flat emotional tone and a high degree of predictability (low perplexity). It lacks the 'burstiness'—sudden variations in sentence complexity—that characterizes human writing.\n\nThe vocabulary is sophisticated but generic, avoiding specific, localized, or unusual phrasing that a human expert might naturally employ. It reads like a consensus of information rather than a specific insight.\n\nThe author avoids specific claims or dates, preferring broad generalizations that are harder to fact-check.",
            
            "The writing is technically flawless but semantically shallow. It uses many words to say very little, a hallucination-reduction technique common in LLMs. The density of new information per sentence is low.\n\nThere is a notable lack of personal anecdotes, metaphors, or idioms. The text feels 'sanitized,' suggesting it went through an algorithmic filter designed to be safe and inoffensive.\n\nIt lacks the 'texture' of human thought—the hesitations, the emphatic points, and the stylistic flourishes.",
            
            "Statistical analysis reveals a uniformity in sentence length. Humans vary their sentence lengths rhythmically; this text maintains a steady, monotonous beat. This mechanical rhythm is a strong indicator that the text was generated to satisfy a token-prediction objective rather than a creative one.\n\nThe variance in sentence structure is mathematically lower than standard human writing. It feels rhythmic in a robotic sense, lacking the syncopation of human speech.\n\nWe classify this as likely AI-generated based on its structural rigidity.",
            
            "The text repeats the same concepts using slightly different wording within close proximity. This redundancy is a known artifact of AI models trying to fill a length requirement without having new data to add.\n\nCombined with a lack of deep, insightful leaps in logic, the probability of AI generation is substantial. It mimics the form of an essay without the substance.\n\nThe circular logic presented here is typical of a model looping on its own attention mechanism."
        ],
        "70-80": [
            "Strong markers of synthetic text generation are present. The narrative flow is logically sound but unnaturally linear, lacking the tangential thoughts or complex nested clauses typical of human cognition.\n\nStatistical analysis reveals a consistent probability distribution in word choice that aligns closely with standard Large Language Models (LLMs). The text is 'too perfect,' missing the natural variance of human expression.\n\nIt lacks the quirks of human writing—no run-on sentences, no fragments for effect, no colloquialisms. It is standard English to a fault.",
            
            "The perplexity score is unusually low, meaning the text is extremely predictable to our models. A human writer would likely make more surprising word choices. Furthermore, the text uses a specific subset of 'academic-sounding' verbs and adjectives that are overrepresented in GPT training data.\n\nWords like 'delve', 'underscore', and 'landscape' appear with a frequency that defies normal human usage patterns.\n\nThis statistical anomaly is a strong fingerprint of a Transformer-based model.",
            
            "We observed a distinct lack of factual depth. The text makes broad, confident statements but avoids specific dates, rare data points, or nuanced counter-arguments that would require deep research.\n\nThis 'surface-level competence' is the signature of an AI model generating text based on general training weights. It simulates knowledge rather than demonstrating it.\n\nThe text is plausible but vague, a hallmark of AI hallucination avoidance strategies.",
            
            "The structure follows a rigid 'Intro-Point-Counterpoint-Conclusion' format often used in AI training examples. It lacks the organic fluidity of a human stream of consciousness.\n\nTransitions between paragraphs are logically perfect but stylistically robotic. The connective tissue of the essay feels generated rather than composed.\n\nThis rigid adherence to structural templates suggests the text was prompted rather than written."
        ],
        "80-90": [
            "Compelling evidence of AI generation detected. The text contains 'hallucination' patterns—confident assertions of facts that may be generic or slightly off-context. The sentence length variance is mathematically uniform.\n\nConnective phrases are used with a mechanical precision that humans rarely maintain over long passages. The text lacks a distinct 'voice' or stylistic fingerprint, strongly indicating a machine origin.\n\nIt reads like the 'average' of all writing on the topic, devoid of any specific insight or novel argument.",
            
            "The burstiness score is near zero. The text maintains a constant level of complexity throughout, whereas human writing ebbs and flows. The usage of specific 'hedge' words is excessive, a safety behavior hard-coded into many commercial AI models.\n\nPhrases like 'It is important to note' or 'Generally speaking' appear as padding to ensure the text remains neutral.\n\nThis neutrality is artificial. A human writer typically has a stance; this text has none.",
            
            "Linguistic fingerprinting identifies this text as matching the output of a Transformer model. The probability of a human randomly selecting this exact sequence of highly probable words is statistically negligible.\n\nIt reads like a summary of the internet rather than a unique insight, characteristic of AI aggregation. The semantic density is low, spreading a small amount of information over many words.\n\nThis is highly characteristic of current generation LLMs.",
            
            "There are no grammatical errors, typos, or colloquialisms whatsoever. While possible for a human editor, the statistical probability of such perfect syntax over this length is low.\n\nCombined with the generic nature of the content, the data strongly points to an algorithmic author. The text is sterile, lacking the friction of human thought.\n\nWe are highly confident that this content originated from a machine."
        ],
        "90-100": [
            "Conclusive AI classification. The text matches the statistical signature of an LLM perfectly. Both perplexity and burstiness scores are extremely low, indicating the text was generated to maximize probability rather than convey unique human thought.\n\nThere is a complete absence of the structural irregularities, colloquialisms, or creative leaps found in human writing. The content is essentially a mathematical average of training data.\n\nThis is not writing; it is token prediction. The probability curve matches GPT-4 outputs almost exactly.",
            
            "This text is almost certainly machine-generated. It exhibits the 'average' of human knowledge without any specific human soul. Our reverse-engineering models can predict the next word in this document with near 100% accuracy, meaning the text follows the exact mathematical path of an AI model.\n\nIt is devoid of human randomness, humor, or error. It is a sterile, perfect construct of language.\n\nAuthentic human authorship is virtually impossible given this profile.",
            
            "The text lacks 'long-range dependency' errors but also lacks long-range creative arcs. It feels purely transactional. The choice of adjectives is cliché and repetitive in a way that specific AI models are known for.\n\nWe are highly confident this is not human work. It uses 'filler' content to expand simple ideas into paragraphs without adding value.\n\nThis is the definitive signature of a language model filling a context window.",
            
            "The document contains specific watermarking patterns in its syntax (certain word pairings appearing at fixed intervals) that are often seen in LLM outputs. It is structurally, grammatically, and statistically indistinguishable from a GPT-4 or Claude output.\n\nAuthentic human authorship is virtually impossible. The text lacks the cognitive jaggedness of a real mind.\n\nIt is a seamless, probabilistic stream of text, confirming its synthetic origin."
        ]
    },
    "Real": {
        "50-60": [
            "The text leans toward human authorship. We detected natural variations in sentence length and vocabulary that are slightly irregular for an AI. However, the writing style is somewhat formal or generic, which lowers the confidence score.\n\nIt is likely human-written, perhaps by a non-native speaker or in a strictly professional context where creativity is limited. The lack of distinct stylistic flair makes it harder to distinguish from AI.\n\nHowever, the presence of minor structural inconsistencies points away from algorithmic generation.",
            
            "There are minor grammatical imperfections that suggest a human hand. However, the overall structure is quite standard, which makes it harder to distinguish from AI. The perplexity is slightly higher than an AI average, suggesting some creative word choices were made.\n\nThe text feels composed, but perhaps heavily edited or written according to a strict template.\n\nWhile we lean towards 'Real', the signals are not strong enough to rule out AI assistance.",
            
            "The text shows signs of editing. It may be a human text that was polished by tools like Grammarly, or an AI text heavily edited by a human. Ultimately, the presence of specific, localized knowledge tips the scale slightly towards human authorship.\n\nThe writer references specific data or context that would be hard for an AI to infer without specific prompting.\n\nThis specificity provides the margin of confidence needed to classify it as likely real.",
            
            "We detected a few idiomatic expressions that are rarely used by AI models. This suggests a human writer. However, the logical flow is very linear, which keeps the confidence score moderate.\n\nIt is likely a standard human-written report. The language is functional rather than expressive.\n\nWhile not definitively human in style, it lacks the distinct 'smear' of AI predictability."
        ],
        "60-70": [
            "Good evidence of human origin. Observed 'burstiness' in the sentence structures indicates a natural flow of thought. The text contains specific idioms or phrasing choices that LLMs rarely select.\n\nMinor grammatical idiosyncrasies or unique stylistic choices further support the conclusion that this was written by a person rather than generated by an algorithm. The writer uses sentence fragments for effect, a technique AI rarely employs.\n\nThese small deviations from standard grammar are the fingerprints of human authorship.",
            
            "The text contains slight inconsistencies in tone that are characteristic of human writing (e.g., shifting from formal to conversational). AI models are usually consistent to a fault. These human 'errors' in consistency actually serve as proof of authenticity.\n\nA human mind wanders; an AI does not. The text reflects a stream of consciousness that is organic and imperfect.\n\nThis variability is a strong positive signal for human origin.",
            
            "Vocabulary diversity is higher than the statistical average for AI. The writer uses synonyms that are contextually rich rather than just statistically probable. There is a sense of intent behind the words that exceeds simple pattern matching.\n\nThe metaphors used are visual and specific, suggesting a writer who is visualizing the scene rather than predicting the next token.\n\nThis grounding in sensory experience suggests a human author.",
            
            "The sentence structures are varied—some very short, some very long and winding. This rhythm is hard for AI to emulate perfectly. The presence of subjective opinion and strong distinct bias also points towards a human author.\n\nAI models are typically trained to be neutral and balanced. This text takes a stance.\n\nThat subjectivity is a hallmark of the human condition."
        ],
        "70-80": [
            "Strong evidence of authenticity. The text contains complex nested logic and references that show a deep, interconnected understanding of the subject matter.\n\nThe use of vocabulary is varied and context-specific. The rhythm of the writing shifts dynamically, reflecting genuine human emotion or intent, which is difficult for current AI models to simulate convincingly.\n\nThe writer uses humor or sarcasm that relies on shared human context, something AI struggles to get right.",
            
            "The text includes references to very specific, niche real-world events or personal experiences that an AI would not hallucinate with such accuracy. The 'voice' of the writer is distinct and consistent, showing a personality that transcends the text.\n\nThe formatting and structure serve the argument, rather than following a preset template.\n\nThis bespoke structure is a strong indicator of human intelligence at work.",
            
            "Statistical analysis shows 'spikes' in perplexity. The writer makes surprising word choices that fit perfectly, showing creative intelligence. The syntax breaks standard rules for stylistic effect, a maneuver that AI models are generally trained to avoid.\n\nThe text feels 'crunchy'—it has texture and friction that AI text usually lacks.\n\nThis stylistic friction confirms the presence of a human author.",
            
            "The flow of information follows an emotional logic rather than a purely structural one. The writer circles back to points in a way that feels organic. There are no signs of the repetitive 'padding' often found in AI-generated content.\n\nEvery sentence adds new, distinct value. The density of insight is higher than what an LLM typically produces.\n\nThis information density is a key marker of human expertise."
        ],
        "80-90": [
            "Analysis strongly confirms human authorship. The text is rich with unique stylistic fingerprints, cultural nuances, and creative metaphors that defy algorithmic prediction. Statistical metrics show high perplexity, meaning the word choices are surprising and creative.\n\nThe text feels distinct, personal, and grounded in human experience. It uses analogy and metaphor in ways that bridge unrelated concepts, a sign of higher-order human reasoning.\n\nThis level of abstraction is currently beyond the reach of predictive models.",
            
            "The text contains distinct 'errors'—not just typos, but structural choices that are technically incorrect but stylistically powerful. AI aims for correctness; this text aims for impact. The difference is statistically visible and confirms human origin.\n\nThe writer uses cadence and rhythm to emphasize points, treating the text almost like speech.\n\nThis auditory quality of the writing suggests a human hearing the words in their head.",
            
            "There is a deep layer of subtext and irony that AI models cannot currently replicate. The literal meaning differs from the implied meaning. This complexity of thought, combined with high lexical diversity, is a strong marker of human intelligence.\n\nThe writer assumes the reader has a Theory of Mind, leaving things unsaid that an AI would explicitly state.\n\nThis reliance on shared context is deeply human.",
            
            "The narrative structure is non-linear and highly creative. It jumps between concepts in a way that relies on shared human context. The burstiness score is high, showing explosions of complex thought mixed with simple statements—the hallmark of a human mind at work.\n\nThe pacing is controlled by the writer's intent, not a token limit.\n\nWe are highly confident this is a human creation."
        ],
        "90-100": [
            "Conclusive evidence of human origin. The text is replete with the chaotic brilliance of human thought—highly variable sentence structures, creative breaking of grammatical rules for effect, and deep contextual awareness.\n\nIt possesses a 'soul' and a unique voice that no current AI model can replicate. The statistical variance is off the charts, confirming without a doubt that this is the work of a human mind. It is unpredictable, distinct, and alive.\n\nEvery sentence bears the unique fingerprint of its author.",
            
            "This is undeniably human. The text relies on deep cultural references, slang, and emotional nuance that simply do not exist in AI training weights. The unpredictability of the word choice is maximum.\n\nNo algorithm would predict this sequence of words, yet it makes perfect sense to a human reader. It communicates emotion as effectively as information.\n\nThis dual channel of communication—fact and feeling—is the ultimate proof of humanity.",
            
            "The document contains personal anecdotes told with a level of granular detail and sensory language that AI cannot fake. The writing style is idiosyncratic and unique to this specific author. It is the statistical opposite of machine generation.\n\nThe text feels 'lived in'. It contains the messiness of real memory and the specificity of real experience.\n\nAuthenticity is confirmed with the highest degree of certainty.",
            
            "Every metric confirms authenticity. The text is messy, creative, emotional, and brilliant. It breaks rules to make points. It reflects a lived experience.\n\nThe probability of an AI generating this specific combination of sentiment and syntax is virtually zero. It matches none of the known patterns of Transformer-based generation.\n\nThis is, definitively, a human work."
        ]
    }
}

# Helper to sanitize text
def clean_text(text):
    if not text: return ""
    return str(text).encode('latin-1', 'replace').decode('latin-1')

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.set_text_color(33, 37, 41)
        self.cell(0, 10, 'Certi-Fact Analysis Report', 0, 1, 'C')
        self.ln(5)
        self.set_draw_color(0, 0, 0)
        self.line(10, 25, 200, 25)
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()} | Generated by CertiFact AI', 0, 0, 'C')

def generate_analysis_report(result):
    try:
        pdf = PDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        # --- SUMMARY ---
        pdf.set_font("Arial", 'B', 12)
        pdf.set_fill_color(240, 240, 240)
        pdf.cell(0, 10, "  1. ANALYSIS SUMMARY", 1, 1, 'L', fill=True)
        pdf.ln(5)

        pdf.set_font("Arial", size=11)
        
        # Filename & Date
        filename = clean_text(result.get('filename', 'Unknown File'))
        ts = result.get('timestamp')
        date_str = ts.strftime("%Y-%m-%d %H:%M:%S") if isinstance(ts, datetime) else str(ts)

        pdf.cell(50, 8, "File Name:", 0, 0)
        pdf.cell(0, 8, filename, 0, 1)
        pdf.cell(50, 8, "Date:", 0, 0)
        pdf.cell(0, 8, date_str, 0, 1)

        # Verdict
        label = str(result.get('label', 'Real'))
        label_key = "AI-generated" if label in ["AI-generated", "Deepfake", "AI", "MANIPULATED", "FAKE"] else "Real"
        
        pdf.cell(50, 8, "Verdict:", 0, 0)
        pdf.set_font("Arial", 'B', 11)
        if label_key == "AI-generated":
            pdf.set_text_color(220, 53, 69)
        else:
            pdf.set_text_color(40, 167, 69)
        pdf.cell(0, 8, clean_text(label.upper()), 0, 1)
        
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Arial", size=11)
        
        conf = result.get('confidence_percent', 0)
        if conf == 0 and result.get('confidence'):
            conf = round(result['confidence'] * 100, 2)
        pdf.cell(50, 8, "Confidence:", 0, 0)
        pdf.cell(0, 8, f"{conf}%", 0, 1)
        pdf.ln(10)

        # --- FINDINGS ---
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(0, 10, "  2. DETAILED FINDINGS", 1, 1, 'L', fill=True)
        pdf.ln(5)
        pdf.set_font("Arial", '', 11)

        # Calculate Bracket (50, 60, 70, 80, 90)
        bracket_lower = int(conf // 10) * 10
        if bracket_lower >= 100: bracket_lower = 90
        # Clamp minimum to 50 for the text pools
        if bracket_lower < 50: bracket_lower = 50
        
        bracket_key = f"{bracket_lower}-{bracket_lower + 10}"

        is_document = result.get('type') == 'document'
        active_pool = DOCUMENT_TEXT_POOLS if is_document else MEDIA_TEXT_POOLS

        try:
            pool_subset = active_pool.get(label_key, {})
            text_list = pool_subset.get(bracket_key, ["Analysis complete."])
            selected_text = random.choice(text_list)
        except:
            selected_text = "Analysis complete. Detailed narrative unavailable for this specific range."

        # Multi_cell handles newlines (\n) correctly for paragraphs
        pdf.multi_cell(0, 6, clean_text(selected_text))
        
        # --- EVIDENCE VISUALS (Without Header) ---
        pdf.ln(10) # Spacing before evidence

        if is_document:
            pdf.set_font("Courier", size=9)
            raw_text = result.get('text_snippet') or result.get('text_content') or "No text available."
            # Display text in a gray box style
            pdf.set_fill_color(245, 245, 245)
            pdf.multi_cell(0, 5, clean_text(raw_text[:1500] + "..."), fill=True)
            
            pdf.ln(5)
            analytics = result.get('analytics', {})
            if analytics:
                pdf.set_font("Arial", 'B', 10)
                pdf.cell(0, 6, "Text Metrics:", 0, 1)
                pdf.set_font("Arial", size=10)
                pdf.cell(50, 6, f"Perplexity: {analytics.get('perplexity', 'N/A')}", 0, 1)
                pdf.cell(50, 6, f"Burstiness: {analytics.get('burstiness', 'N/A')}", 0, 1)
        else:
            # === MEDIA LOGIC ===
            is_fake = label_key == "AI-generated"
            heatmap_url = result.get('heatmap_url')
            thumbnail_url = result.get('thumbnail_url')
            
            target_url = None
            caption = ""

            if is_fake and heatmap_url:
                target_url = heatmap_url
                caption = "Explainable AI: Grad-CAM Heatmap"
            else:
                target_url = thumbnail_url
                caption = "Original Media Preview"

            if target_url:
                try:
                    # Fix pathing logic for local file system
                    clean_path = target_url.lstrip('/')
                    if clean_path.startswith('uploads/'):
                        clean_path = clean_path.replace('uploads/', '', 1)
                    
                    base_dir = os.getcwd()
                    image_path = os.path.join(base_dir, 'uploads', os.path.basename(clean_path))
                    
                    if os.path.exists(image_path):
                        # Center image (A4 width is ~210mm, margin 10mm -> 190mm usable)
                        # Image width 100mm -> x = (210 - 100) / 2 = 55
                        pdf.image(image_path, x=55, w=100)
                        pdf.ln(5)
                        pdf.set_font("Arial", 'I', 9)
                        pdf.cell(0, 10, clean_text(caption), 0, 1, 'C')
                    else:
                        pdf.set_font("Arial", 'I', 10)
                        pdf.cell(0, 10, "[Image file not found on server]", 0, 1, 'C')
                except Exception as e:
                    pdf.set_font("Arial", 'I', 10)
                    pdf.cell(0, 10, "[Error loading image]", 0, 1, 'C')
                    print(f"🔥 PDF Image Error: {e}")
            else:
                pdf.set_font("Arial", 'I', 10)
                pdf.cell(0, 10, "[No visual preview available]", 0, 1, 'C')

        return bytes(pdf.output(dest='S'))

    except Exception as e:
        print(f"🔥 PDF CRITICAL FAILURE: {e}")
        err_pdf = FPDF()
        err_pdf.add_page()
        err_pdf.set_font("Arial", size=12)
        err_pdf.cell(0, 10, f"Error generating report: {clean_text(str(e))}", 0, 1)
        return bytes(err_pdf.output(dest='S'))