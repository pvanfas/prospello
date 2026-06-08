import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { useToast } from "../Toast"; // Import the useToast hook
import { useLoadScript, Autocomplete } from "@react-google-maps/api";

// Custom Dialog Components (simplified shadcn/ui implementation)
const Dialog = ({ open, onOpenChange, children }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-md"
                onClick={() => onOpenChange(false)}
            />
            <div className="relative w-full max-w-2xl md:rounded-t-2xl md:rounded-b-lg bg-white md:max-h-[90vh] h-[90vh] md:h-auto overflow-hidden">
                {children}
            </div>
        </div>
    );
};

const DialogContent = ({ className = "", children, ...props }) => (
    <div
        className={`h-full flex flex-col ${className}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
    >
        {children}
    </div>
);

const DialogHeader = ({ className = "", children }) => (
    <div className={className}>{children}</div>
);

const DialogTitle = ({ className = "", children }) => (
    <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>
);

const DialogDescription = ({ className = "", children }) => (
    <p className={`text-sm text-gray-600 ${className}`}>{children}</p>
);

// Custom Button Component
const Button = ({
    variant = "default",
    size = "default",
    className = "",
    children,
    disabled = false,
    ...props
}) => {
    const baseStyles =
        "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
        default: "bg-orange-500 text-white hover:bg-orange-600 shadow-sm",
        outline: "border border-gray-200 bg-white hover:bg-gray-50 shadow-sm",
        ghost: "hover:bg-gray-100",
    };

    const sizes = {
        default: "h-12 px-5 py-3",
        sm: "h-10 px-4",
        lg: "h-14 px-8",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

// Custom Input Component
const Input = ({ className = "", error = false, ...props }) => (
    <input
        className={`flex h-12 w-full rounded-xl border ${
            error ? "border-red-300" : "border-gray-200"
        } bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 ${className}`}
        {...props}
    />
);

// Custom Textarea Component
const Textarea = ({ className = "", ...props }) => (
    <textarea
        className={`flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 ${className}`}
        {...props}
    />
);

// Custom Select Components
const Select = ({ children, value, onValueChange, error = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value);

    const handleSelect = (newValue) => {
        setSelectedValue(newValue);
        onValueChange(newValue);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {React.Children.map(children, (child) =>
                React.cloneElement(child, {
                    isOpen,
                    setIsOpen,
                    selectedValue,
                    onSelect: handleSelect,
                    error,
                })
            )}
        </div>
    );
};

const SelectTrigger = ({
    children,
    isOpen,
    setIsOpen,
    className = "",
    error = false,
}) => (
    <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-12  items-center justify-between rounded-xl border ${
            error ? "border-red-300" : "border-gray-200"
        } bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 ${className}`}
    >
        {children}
        <svg
            className="h-4 w-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 9l6 6 6-6"
            />
        </svg>
    </button>
);

const SelectValue = ({
    selectedValue,
    placeholder = "Select...",
    type = "category",
}) => {
    const categories = {
        perishable: "Perishable",
        non_perishable: "Non Perishable",
        high_value: "High Value",
        oversize: "Oversize",
        general: "General",
    };

    const languages = {
        english: "English",
        hindi: "Hindi",
        tamil: "Tamil",
        malayalam: "Malayalam",
    };

    const getDisplayValue = () => {
        if (!selectedValue) return placeholder;

        if (type === "language") {
            return languages[selectedValue] || selectedValue;
        } else {
            return categories[selectedValue] || selectedValue;
        }
    };

    return (
        <span className={selectedValue ? "text-gray-900" : "text-gray-400"}>
            {getDisplayValue()}
        </span>
    );
};

const SelectContent = ({ children, isOpen, onSelect }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute top-full z-50 w-full rounded-xl border border-gray-200 bg-white shadow-lg mt-1 overflow-hidden">
            {React.Children.map(children, (child) =>
                React.cloneElement(child, { onSelect })
            )}
        </div>
    );
};

const SelectItem = ({ children, value, onSelect }) => (
    <button
        onClick={() => onSelect(value)}
        className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 focus:bg-orange-50 transition-colors"
    >
        {children}
    </button>
);

// Lucide React Icons (simplified SVG implementations)
const Mic = ({ size = 24, className = "" }) => (
    <svg
        width={size}
        height={size}
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 10v2a7 7 0 0 1-14 0v-2"
        />
        <line
            x1="12"
            y1="19"
            x2="12"
            y2="23"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
        <line
            x1="8"
            y1="23"
            x2="16"
            y2="23"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
    </svg>
);

const Image = ({ size = 24, className = "" }) => (
    <svg
        width={size}
        height={size}
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="2"
            ry="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
        <circle
            cx="8.5"
            cy="8.5"
            r="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 15l-5-5L5 21"
        />
    </svg>
);

const Type = ({ size = 24, className = "" }) => (
    <svg
        width={size}
        height={size}
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <polyline
            points="4,7 4,4 20,4 20,7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
        <line
            x1="9"
            y1="20"
            x2="15"
            y2="20"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
        <line
            x1="12"
            y1="4"
            x2="12"
            y2="20"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
    </svg>
);

const Upload = ({ size = 24, className = "" }) => (
    <svg
        width={size}
        height={size}
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
        />
        <polyline
            points="7,10 12,5 17,10"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
        <line
            x1="12"
            y1="5"
            x2="12"
            y2="15"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
    </svg>
);

const Languages = ({ size = 24, className = "" }) => (
    <svg
        width={size}
        height={size}
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 0 1 6.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
    </svg>
);

const X = ({ size = 24, className = "" }) => (
    <svg
        width={size}
        height={size}
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <line
            x1="18"
            y1="6"
            x2="6"
            y2="18"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
        <line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
    </svg>
);

const Plus = ({ size = 24, className = "" }) => (
    <svg
        width={size}
        height={size}
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <line
            x1="12"
            y1="5"
            x2="12"
            y2="19"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
        <line
            x1="5"
            y1="12"
            x2="19"
            y2="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
    </svg>
);

const AlertTriangle = ({ size = 16, className = "" }) => (
    <svg
        width={size}
        height={size}
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
    </svg>
);

const GoodsCategory = {
    PERISHABLE: "perishable",
    NON_PERISHABLE: "non_perishable",
    HIGH_VALUE: "high_value",
    OVERSIZE: "oversize",
    GENERAL: "general",
};

// Google Maps libraries to load
const libraries = ["places"];

// Google Maps API Key - get from environment variable
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

// Main Component
const CreateLoadModal = ({ open, onOpenChange, fetchLoads }) => {
    const [activeTab, setActiveTab] = useState("text");
    const [isRecording, setIsRecording] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("english");
    const [transcribedText, setTranscribedText] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const { showToast } = useToast(); // Use the toast context
    
    // Load Google Maps script
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: libraries,
    });

    // Form data
    const [formData, setFormData] = useState({
    goodsType: "",
    weight: "",
    origin: "",
    destination: "",
    dimensions: "",
    specialInstructions: "",
    category: "",
    orgin_place: "",
    destination_place: "",
    vehicleTypes: ["any"],  // Default to "any"
    // Add image field for text mode
    imageBase64: null,
    imageFileName: null
});

    const fileInputRef = useRef(null);
    const originAutocompleteRef = useRef(null);
    const destinationAutocompleteRef = useRef(null);
    
    // Voice input states for individual fields
    const [activeVoiceField, setActiveVoiceField] = useState(null);
    const [fieldRecognition, setFieldRecognition] = useState(null);

    const tabs = [
        { id: "text", label: "Text", icon: Type },
        { id: "voice", label: "Voice", icon: Mic },
        { id: "image", label: "Image", icon: Image },
    ];

    const languages = [
        { value: "english", label: "English", code: "en-US" },
        { value: "hindi", label: "Hindi", code: "hi-IN" },
        { value: "tamil", label: "Tamil", code: "ta-IN" },
        { value: "malayalam", label: "Malayalam", code: "ml-IN" },
    ];

    // Initialize speech recognition
    const initializeSpeechRecognition = () => {
        if (
            !("webkitSpeechRecognition" in window) &&
            !("SpeechRecognition" in window)
        ) {
            showToast(
                "error",
                "❌ Speech recognition not supported in this browser"
            );
            return null;
        }

        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        // Get language code for selected language
        const selectedLang = languages.find(
            (lang) => lang.value === selectedLanguage
        );
        recognition.lang = selectedLang ? selectedLang.code : "en-US";

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        let finalTranscript = "";

        recognition.onresult = (event) => {
            let interimTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + " ";
                } else {
                    interimTranscript += transcript;
                }
            }

            // Update the transcribed text with both final and interim results
            setTranscribedText(finalTranscript + interimTranscript);
        };

        recognition.onstart = () => {
            setIsRecording(true);
            finalTranscript = ""; // Reset transcript when starting
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsRecording(false);

            let errorMessage = "❌ Speech recognition error";
            switch (event.error) {
                case "network":
                    errorMessage = "❌ Network error during speech recognition";
                    break;
                case "not-allowed":
                    errorMessage =
                        "❌ Microphone access denied. Please allow microphone access.";
                    break;
                case "no-speech":
                    errorMessage = "❌ No speech detected. Please try again.";
                    break;
                case "audio-capture":
                    errorMessage =
                        "❌ No microphone found. Please check your microphone.";
                    break;
                default:
                    errorMessage = `❌ Speech recognition error: ${event.error}`;
            }

            showToast("error", errorMessage);
        };

        return recognition;
    };

    // Handle language change and update recognition
const handleLanguageChange = (language) => {
    setSelectedLanguage(language);

    // If currently recording, stop and restart with new language
    if (isRecording && recognition) {
        recognition.stop();
        setTimeout(() => {
            const newRecognition = initializeSpeechRecognition();
            setRecognition(newRecognition);
            if (newRecognition) {
                newRecognition.start();
            }
        }, 100);
    }
};

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const extractPlaceInfo = (place) => {
        if (!place.formatted_address) return null;
        
        let placeName = place.name; // Default to business/place name
        
        // Extract route (street name) from address_components
        if (place.address_components) {
            const route = place.address_components.find(
                component => component.types.includes('route')
            );
            
            const sublocality = place.address_components.find(
                component => component.types.includes('sublocality_level_1')
            );
            
            const locality = place.address_components.find(
                component => component.types.includes('locality')
            );
            
            // Priority: route (street) > sublocality > locality > business name
            placeName = route?.long_name || 
                       sublocality?.long_name || 
                       locality?.long_name || 
                       place.name;
        }
        
        return {
            fullAddress: place.formatted_address,
            placeName: placeName
        };
    };

    // Handle place selection for origin
    const onOriginLoad = (autocomplete) => {
        originAutocompleteRef.current = autocomplete;
    };

    const onOriginPlaceChanged = () => {
    if (originAutocompleteRef.current !== null) {
        const place = originAutocompleteRef.current.getPlace();
        const placeInfo = extractPlaceInfo(place);
        
        if (placeInfo) {
            handleInputChange("origin", placeInfo.fullAddress);
            handleInputChange("origin_place", placeInfo.placeName);
        }
    }
};

    // Handle place selection for destination
    const onDestinationLoad = (autocomplete) => {
        destinationAutocompleteRef.current = autocomplete;
    };

    const onDestinationPlaceChanged = () => {
        if (destinationAutocompleteRef.current !== null) {
            const place = destinationAutocompleteRef.current.getPlace();
            const placeInfo = extractPlaceInfo(place);
            
            if (placeInfo) {
                handleInputChange("destination", placeInfo.fullAddress);
                handleInputChange("destination_place", placeInfo.placeName);
            }
        }
    };

    // Voice input for individual fields
    const handleFieldVoiceInput = (fieldName) => {
        if (activeVoiceField === fieldName) {
            // Stop recording
            if (fieldRecognition) {
                fieldRecognition.stop();
            }
            setActiveVoiceField(null);
        } else {
            // Start recording for this field
            if (fieldRecognition) {
                fieldRecognition.stop();
            }

            if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
                showToast("error", "❌ Speech recognition not supported in this browser");
                return;
            }

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.lang = "en-IN"; // Indian English
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event) => {
                let transcript = event.results[0][0].transcript;
                
                // Remove trailing punctuation (period, comma, etc.)
                transcript = transcript.replace(/[.,!?;:]$/g, '').trim();
                
                // For weight field, extract only numbers
                if (fieldName === "weight") {
                    // Extract numbers from the transcript (e.g., "1000" from "Sent. 1000.")
                    const numbers = transcript.match(/\d+\.?\d*/g);
                    if (numbers && numbers.length > 0) {
                        transcript = numbers[0]; // Take the first number found
                    }
                }
                
                // Append or set the value
                const currentValue = formData[fieldName];
                const newValue = currentValue ? currentValue + " " + transcript : transcript;
                handleInputChange(fieldName, newValue);
            };

            recognition.onstart = () => {
                setActiveVoiceField(fieldName);
            };

            recognition.onend = () => {
                setActiveVoiceField(null);
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setActiveVoiceField(null);
                
                let errorMessage = "❌ Speech recognition error";
                switch (event.error) {
                    case "no-speech":
                        errorMessage = "❌ No speech detected. Please try again.";
                        break;
                    case "not-allowed":
                        errorMessage = "❌ Microphone access denied.";
                        break;
                    default:
                        errorMessage = `❌ Error: ${event.error}`;
                }
                showToast("error", errorMessage);
            };

            setFieldRecognition(recognition);
            try {
                recognition.start();
            } catch (error) {
                console.error("Failed to start recognition:", error);
                showToast("error", "❌ Failed to start voice input");
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required fields validation
        if (!formData.goodsType.trim()) {
            newErrors.goodsType = "Goods type is required";
        }
        if (!formData.weight.trim()) {
            newErrors.weight = "Weight is required";
        }
        if (!formData.origin.trim()) {
            newErrors.origin = "Origin is required";
        }
        if (!formData.destination.trim()) {
            newErrors.destination = "Destination is required";
        }
        if (!formData.category) {
            newErrors.category = "Category is required";
        }
      

        // Weight validation
        if (formData.weight && isNaN(Number(formData.weight))) {
            newErrors.weight = "Weight must be a valid number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRecordingToggle = () => {
        if (isRecording) {
            // Stop recording
            if (recognition) {
                recognition.stop();
            }
        } else {
            // Start recording
            const newRecognition = initializeSpeechRecognition();
            setRecognition(newRecognition);

            if (newRecognition) {
                try {
                    newRecognition.start();
                } catch (error) {
                    console.error("Failed to start speech recognition:", error);
                    showToast("error", "❌ Failed to start speech recognition");
                }
            }
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTextModeImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            showToast("error", "❌ Image size must be less than 10MB");
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast("error", "❌ Please select a valid image file");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setFormData(prev => ({
                ...prev,
                imageBase64: e.target.result,
                imageFileName: file.name
            }));
        };
        reader.readAsDataURL(file);
    }
};

const handleRemoveTextModeImage = () => {
    setFormData(prev => ({
        ...prev,
        imageBase64: null,
        imageFileName: null
    }));
    // Clear the file input
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
};

// Update the handleTextSubmit function to include image data
const handleTextSubmit = async (data) => {
    try {
        setLoading(true);
        
        // Include image data if present
        const submitData = {
            ...data,
            image_base64: formData.imageBase64,
            image_filename: formData.imageFileName
        };

        const response = await api.post("/v1/load/text/", submitData);
        if (response.status === 200) {
            showToast("success", "✅ Load created successfully!");
            // Reset form
            setFormData({
                goodsType: "",
                weight: "",
                origin: "",
                destination: "",
                dimensions: "",
                specialInstructions: "",
                category: "",
                vehicleTypes: ["any"],
                imageBase64: null,
                imageFileName: null
            });
            fetchLoads();
        }
    } catch (error) {
        console.error("Error submitting text:", error);
        showToast("error", "❌ Error creating load. Please try again.");
    } finally {
        setLoading(false);
    }
};

// Update the handleSave function to clear image data on form reset
const handleSave = async () => {
    // ... existing validation logic ...

    try {
        let snakeCase = {
            origin: formData.origin,
            destination: formData.destination,
            goods_type: formData.goodsType,
            weight: parseFloat(formData.weight),
            dimensions: formData.dimensions,
            special_instructions: formData.specialInstructions,
            category: formData.category,
            orgin_place: formData.orgin_place,
            destination_place: formData.destination_place,
            vehicle_types: formData.vehicleTypes,
        };

        if (activeTab === "text") {
            snakeCase.source_type = "text";
            snakeCase.source_content = "";
            // Add image data
            snakeCase.image_base64 = formData.imageBase64;
            snakeCase.image_filename = formData.imageFileName;
            
            await handleTextSubmit(snakeCase);
        } else if (activeTab === "voice") {
            await handleVoiceSubmit();
        } else if (activeTab === "image") {
            await handleImageSubmit();
        }

        onOpenChange(false);
        
        // Reset all form data including images
        setFormData({
            goodsType: "",
            weight: "",
            origin: "",
            destination: "",
            dimensions: "",
            specialInstructions: "",
            category: "",
            vehicleTypes: ["any"],
            imageBase64: null,
            imageFileName: null
        });
        setTranscribedText("");
        setSelectedImage(null);
        setActiveTab("text");
        setErrors({});
    } catch (error) {
        console.error("Error saving:", error);
        showToast("error", "❌ Error saving load. Please try again.");
    }
};

    const handleVoiceSubmit = async () => {
        // Prevent duplicate submissions
        if (loading) {
            console.log("Voice submission already in progress, skipping...");
            return;
        }
        
        try {
            setLoading(true);
            const response = await api.post("/v1/load/voice/", { text : transcribedText , language: selectedLanguage });
            if (response.status === 200) {
                showToast("success", "✅ Load created successfully!");
                setTranscribedText("");
                setSelectedLanguage("");
                fetchLoads(); // Refresh the load list
            }
        } catch (error) {
            console.error("Error submitting voice:", error);
            showToast("error", "❌ Error creating load. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageSubmit = async () => {
        try {
            setLoading(true);
           const response = await api.post("/v1/load/image/", { image_base64: selectedImage });
           if (response.status === 200) {
               showToast("success", "✅ Load created successfully!");
               setSelectedImage(null);
                fetchLoads(); // Refresh the load list
                setLoading(false);
           }
        } catch (error) {
            console.error("Error submitting image:", error);
        }
    };

    // const handleSave = async () => {
    //     // For text mode, validate the form
    //     if (activeTab === "text" && !validateForm()) {
    //         return;
    //     }

    //     // For voice mode, check if transcribed text exists
    //     if (activeTab === "voice" && !transcribedText.trim()) {
    //         setErrors({
    //             voice: "Please record and transcribe your message first",
    //         });
    //         return;
    //     }

    //     // For image mode, check if image is selected
    //     if (activeTab === "image" && !selectedImage) {
    //         setErrors({ image: "Please select an image first" });
    //         return;
    //     }

    //     try {
    //         let snakeCase = {
    //             origin: formData.origin,
    //             destination: formData.destination,
    //             goods_type: formData.goodsType,
    //             weight: parseFloat(formData.weight),
    //             dimensions: formData.dimensions,
    //             special_instructions: formData.specialInstructions,
    //             category: formData.category,
    //         };

    //         if (activeTab === "text") {
    //             snakeCase.source_type = "text";
    //             snakeCase.source_content = "";
    //             await handleTextSubmit(snakeCase);
    //         } else if (activeTab === "voice") {
    //             await handleVoiceSubmit();
    //         } else if (activeTab === "image") {
    //             await handleImageSubmit();
    //         }

    //         onOpenChange(false);
    //         // showToast("success", "✅ Load created successfully!"); // Use showToast for success message

    //         // Reset form

    //         setTranscribedText("");
    //         setSelectedImage(null);
    //         setActiveTab("text");
    //         setErrors({});
    //     } catch (error) {
    //         console.error("Error saving:", error);
    //         showToast("error", "❌ Error saving load. Please try again."); // Use showToast for error message
    //     }
    // };

    const renderTextMode = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-5"
    >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goods Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <Input
                        placeholder="Enter goods type"
                        value={formData.goodsType}
                        onChange={(e) =>
                            handleInputChange("goodsType", e.target.value)
                        }
                        className="w-full pr-12"
                        error={!!errors.goodsType}
                    />
                    <button
                        type="button"
                        onClick={() => handleFieldVoiceInput("goodsType")}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                            activeVoiceField === "goodsType"
                                ? "bg-red-500 text-white animate-pulse"
                                : "bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                        }`}
                    >
                        <Mic size={16} />
                    </button>
                </div>
                {errors.goodsType && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {errors.goodsType}
                    </p>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <Input
                        type="number"
                        placeholder="Enter weight"
                        value={formData.weight}
                        onChange={(e) =>
                            handleInputChange("weight", e.target.value)
                        }
                        className="w-full pr-12"
                        error={!!errors.weight}
                    />
                    <button
                        type="button"
                        onClick={() => handleFieldVoiceInput("weight")}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                            activeVoiceField === "weight"
                                ? "bg-red-500 text-white animate-pulse"
                                : "bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                        }`}
                    >
                        <Mic size={16} />
                    </button>
                </div>
                {errors.weight && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {errors.weight}
                    </p>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origin <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    {isLoaded && GOOGLE_MAPS_API_KEY ? (
                        <Autocomplete
                            onLoad={onOriginLoad}
                            onPlaceChanged={onOriginPlaceChanged}
                            options={{
                                types: ['establishment', 'geocode'],
                                componentRestrictions: { country: 'in' }
                            }}
                        >
                            <Input
                                placeholder="Search for shop, place, road, etc."
                                value={formData.origin}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    handleInputChange("origin", value);
                                    handleInputChange("origin_place", value);
                                }}
                                className="w-full pr-12"
                                error={!!errors.origin}
                            />
                        </Autocomplete>
                    ) : (
                        <Input
                        placeholder="Search for shop, place, road, etc."
                        value={formData.origin}
                        onChange={(e) => {
                            const value = e.target.value;
                            handleInputChange("origin", value);
                            handleInputChange("origin_place", value);
                        }}
                        className="w-full pr-12"
                        error={!!errors.origin}
                    />
                    )}
                    <button
                        type="button"
                        onClick={() => handleFieldVoiceInput("origin")}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                            activeVoiceField === "origin"
                                ? "bg-red-500 text-white animate-pulse"
                                : "bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                        }`}
                    >
                        <Mic size={16} />
                    </button>
                </div>
                {errors.origin && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {errors.origin}
                    </p>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    {isLoaded && GOOGLE_MAPS_API_KEY ? (
                        <Autocomplete
                            onLoad={onDestinationLoad}
                            onPlaceChanged={onDestinationPlaceChanged}
                            options={{
                                types: ['establishment', 'geocode'],
                                componentRestrictions: { country: 'in' }
                            }}
                        >
                            <Input
                                placeholder="Search for shop, place, road, etc."
                                value={formData.destination}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    handleInputChange("destination", value);
                                    handleInputChange("destination_place", value);
                                }}
                                className="w-full pr-12"
                                error={!!errors.destination}
                            />
                        </Autocomplete>
                    ) : (
                        <Input
                            placeholder="Search for shop, place, road, etc."
                            value={formData.destination}
                            onChange={(e) => {
                                const value = e.target.value;
                                handleInputChange("destination", value);
                                handleInputChange("destination_place", value);
                            }}
                            className="w-full pr-12"
                            error={!!errors.destination}
                        />
                    )}
                    <button
                        type="button"
                        onClick={() => handleFieldVoiceInput("destination")}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                            activeVoiceField === "destination"
                                ? "bg-red-500 text-white animate-pulse"
                                : "bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                        }`}
                    >
                        <Mic size={16} />
                    </button>
                </div>
                {errors.destination && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {errors.destination}
                    </p>
                )}
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
            </label>
            <Select
                value={formData.category}
                onValueChange={(value) =>
                    handleInputChange("category", value)
                }
                error={!!errors.category}
            >
                <SelectTrigger className="w-full">
                    <SelectValue
                        selectedValue={formData.category}
                        placeholder="Select category"
                    />
                </SelectTrigger>
                <SelectContent>
                    {Object.values(GoodsCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() +
                                category.slice(1).replace("_", " ")}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {errors.category && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {errors.category}
                </p>
            )}
        </div>

        {/* Vehicle Types Multi-Select */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Types
            </label>
            <div className="border border-gray-200 rounded-xl p-3 space-y-2">
                {["any", "truck", "trailer", "pickup", "refrigerated"].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <input
                            type="checkbox"
                            checked={formData.vehicleTypes.includes(type)}
                            onChange={(e) => {
                                let newTypes = [...formData.vehicleTypes];
                                if (e.target.checked) {
                                    // If checking "any", uncheck others
                                    if (type === "any") {
                                        newTypes = ["any"];
                                    } else {
                                        // If checking other types, remove "any"
                                        newTypes = newTypes.filter(t => t !== "any");
                                        newTypes.push(type);
                                    }
                                } else {
                                    newTypes = newTypes.filter(t => t !== type);
                                    // If no types selected, default to "any"
                                    if (newTypes.length === 0) {
                                        newTypes = ["any"];
                                    }
                                }
                                handleInputChange("vehicleTypes", newTypes);
                            }}
                            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{type}</span>
                    </label>
                ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
                Select one or more vehicle types. "Any" accepts all vehicles.
            </p>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensions
            </label>
            <div className="relative">
                <Input
                    placeholder="L x W x H (optional)"
                    value={formData.dimensions}
                    onChange={(e) =>
                        handleInputChange("dimensions", e.target.value)
                    }
                    className="w-full pr-12"
                />
                <button
                    type="button"
                    onClick={() => handleFieldVoiceInput("dimensions")}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                        activeVoiceField === "dimensions"
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                    }`}
                >
                    <Mic size={16} />
                </button>
            </div>
        </div>

        {/* Add Image Upload Section */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Load Image (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleTextModeImageUpload}
                    accept="image/*"
                    className="hidden"
                />
                
                {formData.imageBase64 ? (
                    <div className="space-y-4">
                        <img
                            src={formData.imageBase64}
                            alt="Load preview"
                            className="max-h-32 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-gray-600">
                            {formData.imageFileName}
                        </p>
                        <div className="flex gap-2 justify-center">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                            >
                                Change Image
                            </button>
                            <button
                                type="button"
                                onClick={handleRemoveTextModeImage}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                            >
                                Remove Image
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer"
                    >
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                            <Image size={24} className="text-gray-400" />
                        </div>
                        <p className="text-gray-600 mb-2">
                            Click to upload an image
                        </p>
                        <p className="text-sm text-gray-500">
                            PNG, JPG, JPEG up to 10MB
                        </p>
                    </div>
                )}
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
            </label>
            <div className="relative">
                <Textarea
                    placeholder="Any special handling instructions (optional)"
                    value={formData.specialInstructions}
                    onChange={(e) =>
                        handleInputChange("specialInstructions", e.target.value)
                    }
                    className="w-full min-h-[120px] resize-none pr-12"
                />
                <button
                    type="button"
                    onClick={() => handleFieldVoiceInput("specialInstructions")}
                    className={`absolute right-2 top-2 p-2 rounded-lg transition-all ${
                        activeVoiceField === "specialInstructions"
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                    }`}
                >
                    <Mic size={16} />
                </button>
            </div>
        </div>
    </motion.div>
);


    const renderVoiceMode = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 text-center"
        >
            {/* Warning field for required voice content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left"
            >
                <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-sm">
                        <p className="text-amber-800 font-medium mb-1">Include in your voice recording:</p>
                        <p className="text-amber-700">
                            Goods type, weight, origin, destination, and category
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="flex flex-col items-center space-y-4">
                <motion.button
                    onClick={handleRecordingToggle}
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
                        isRecording
                            ? "bg-red-500 animate-pulse"
                            : "bg-orange-500 hover:bg-orange-600"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Mic size={32} />
                </motion.button>

                <p className="text-sm text-gray-600">
                    {isRecording
                        ? "Recording... Tap to stop"
                        : "Tap to start recording"}
                </p>

                {/* LANGUAGE SELECTOR – full width, english by default */}
                <div className="flex items-center gap-2 w-full">
                    <Languages className="text-gray-400 shrink-0" size={16} />

                    {/* wrapper grows, trigger grows */}
                    <div className="flex-1">
                        <Select
                            value={selectedLanguage}
                            onValueChange={handleLanguageChange}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue
                                    selectedValue={selectedLanguage}
                                    type="language"
                                    placeholder="Select language"
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map((l) => (
                                    <SelectItem key={l.value} value={l.value}>
                                        {l.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
            >
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Live Transcript (editable)
                </label>
                <Textarea
                    value={transcribedText}
                    onChange={(e) => setTranscribedText(e.target.value)}
                    className="w-full min-h-[120px] resize-none text-left"
                    placeholder="Your spoken words will appear here in real time..."
                />
            </motion.div>

            {errors.voice && (
                <p className="text-red-500 text-sm flex items-center justify-center gap-1">
                    <AlertTriangle size={16} />
                    {errors.voice}
                </p>
            )}
        </motion.div>
    );

    const renderImageMode = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            <div className="text-center">
                {selectedImage ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-gray-50 rounded-xl p-4"
                    >
                        <img
                            src={selectedImage}
                            alt="Selected load"
                            className="w-full max-h-64 object-contain rounded-lg"
                        />
                        <Button
                            onClick={() => setSelectedImage(null)}
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                        >
                            <X size={16} />
                        </Button>
                    </motion.div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-orange-400 transition-colors"
                    >
                        <div className="flex flex-col items-center space-y-4">
                            <Upload className="text-gray-400" size={48} />
                            <div>
                                <p className="text-lg font-medium text-gray-700">
                                    Upload Image
                                </p>
                                <p className="text-sm text-gray-500">
                                    Click to select an image of your load
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                />

                <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="mt-4 w-full"
                >
                    <Image className="mr-2" size={16} />
                    {selectedImage ? "Change Image" : "Choose Image"}
                </Button>
            </div>

            {errors.image && (
                <p className="text-red-500 text-sm text-center flex items-center justify-center gap-1">
                    <AlertTriangle size={16} />
                    {errors.image}
                </p>
            )}
        </motion.div>
    );

    // Check if form is valid for Save button
    const isFormValid = () => {
        if (activeTab === "text") {
            return (
                formData.goodsType.trim() &&
                formData.weight.trim() &&
                formData.origin.trim() &&
                formData.destination.trim() &&
                formData.category
            );
        } else if (activeTab === "voice") {
            return transcribedText.trim();
        } else if (activeTab === "image") {
            return selectedImage;
        }
        return false;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 200,
                        }}
                        className="h-full flex flex-col"
                    >
                        {/* Header */}
                        <DialogHeader className="px-6 py-5 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <DialogTitle className="text-2xl font-bold text-gray-800">
                                        Create New Load
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-500 mt-1">
                                        Choose a method to enter your load
                                        details
                                    </DialogDescription>
                                </div>
                                <Button
                                    onClick={() => onOpenChange(false)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-10 w-10 p-0 rounded-full"
                                >
                                    <X size={20} />
                                </Button>
                            </div>

                            {/* Tabs */}
                            <div className="flex space-x-1 bg-gray-100 p-1.5 rounded-xl mt-5">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <motion.button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors relative ${
                                                activeTab === tab.id
                                                    ? "text-white"
                                                    : "text-gray-600 hover:text-gray-800"
                                            }`}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {activeTab === tab.id && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute inset-0 bg-orange-500 rounded-lg"
                                                    transition={{
                                                        type: "spring",
                                                        bounce: 0.2,
                                                        duration: 0.6,
                                                    }}
                                                />
                                            )}
                                            <Icon
                                                size={18}
                                                className="relative z-10"
                                            />
                                            <span className="relative z-10">
                                                {tab.label}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </DialogHeader>

                        {/* Content */}
                        <div className="flex-1 px-6 py-5 overflow-y-auto">
                            <AnimatePresence mode="wait">
                                {activeTab === "text" && renderTextMode()}
                                {activeTab === "voice" && renderVoiceMode()}
                                {activeTab === "image" && renderImageMode()}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-5 pb-20 border-t border-gray-200 bg-white space-y-3 md:space-y-0 md:flex md:justify-between md:items-center md:gap-4">
                            <Button
                                onClick={() => onOpenChange(false)}
                                variant="outline"
                                className="w-full md:w-auto order-2 md:order-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={!isFormValid()}
                                className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white order-1 md:order-2 shadow-md shadow-orange-500/30 disabled:bg-gray-300 disabled:shadow-none"
                            >
                                {loading ? "Loading..." : "Save & Continue"}
                            </Button>
                        </div>
                    </motion.div>
                </DialogContent>
        </Dialog>
    );
};

export default CreateLoadModal;
