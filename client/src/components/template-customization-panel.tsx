import { useState, useEffect } from "react";
import { 
  Save, 
  Check, 
  RotateCcw, 
  Paintbrush, 
  Palette, 
  Layout, 
  Divide, 
  Eye, 
  Sliders, 
  Plus, 
  Minus, 
  Copy, 
  CopyCheck, 
  ArrowLeftRight, 
  RefreshCw, 
  Sidebar, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Columns, 
  PanelLeft, 
  PanelRight, 
  MoveVertical,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Type,
  Bookmark,
  History,
  Sparkles
} from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { fontOptions, colorSchemes, layoutStyles, spacingOptions } from "@/lib/template-utils";
import { type TemplateConfig } from "@/hooks/use-customization";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TemplateCustomizationPanelProps {
  config: TemplateConfig;
  updateConfig: (key: keyof TemplateConfig, value: any) => void;
  saveConfig: () => Promise<boolean>;
  isSaving: boolean;
  isPremium: boolean;
  resetToDefaults: () => void;
}

export function TemplateCustomizationPanel({
  config,
  updateConfig,
  saveConfig,
  isSaving,
  isPremium,
  resetToDefaults,
}: TemplateCustomizationPanelProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("font");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customColor, setCustomColor] = useState("#ffffff");
  const [customColorName, setCustomColorName] = useState("My Custom Color");
  const [savedCustomColors, setSavedCustomColors] = useState<Array<{id: string, name: string, color: string}>>([]);
  const [copied, setCopied] = useState(false);
  const [sectionReorderMode, setSectionReorderMode] = useState(false);
  const [sections, setSections] = useState<string[]>(config.sectionOrder || ["summary", "experience", "education", "skills"]);
  const [sidebarSections, setSidebarSections] = useState<string[]>(config.secondarySections || ["skills"]);
  const [mainSections, setMainSections] = useState<string[]>(config.primarySections || ["summary", "experience", "education"]);
  
  // Define which options are available for free users
  const freeOptions = {
    fonts: ["inter", "roboto", "opensans", "poppins", "lato", "montserrat", "raleway"],
    colorSchemes: ["default", "professional", "modern", "minimal", "bold", "warm"],
    spacing: true,  // Basic spacing is available for free
    sectionLayout: true, // Basic section layout is available for free
  };
  
  // Update config when sections change
  useEffect(() => {
    if (sectionReorderMode) return; // Don't update during reordering
    updateConfig("sectionOrder", sections);
    updateConfig("primarySections", mainSections);
    updateConfig("secondarySections", sidebarSections);
  }, [sections, mainSections, sidebarSections]);
  
  // Initialize sections from config on first load
  useEffect(() => {
    if (config.sectionOrder) {
      setSections(config.sectionOrder);
    }
    if (config.primarySections) {
      setMainSections(config.primarySections);
    }
    if (config.secondarySections) {
      setSidebarSections(config.secondarySections);
    }
  }, []);

  const handleSave = async () => {
    const success = await saveConfig();
    if (success) {
      toast({
        title: "Settings saved",
        description: "Your template customizations have been saved",
      });
    } else {
      toast({
        title: "Failed to save",
        description: "There was an error saving your customizations",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    resetToDefaults();
    toast({
      title: "Reset to defaults",
      description: "Template settings have been reset to default values",
    });
  };

  const saveCustomColor = () => {
    const newColor = {
      id: `custom-${Date.now()}`,
      name: customColorName || "Custom Color",
      color: customColor
    };
    setSavedCustomColors([...savedCustomColors, newColor]);
    toast({
      title: "Color saved",
      description: `"${newColor.name}" has been saved to your custom colors`,
    });
  };

  const applyCustomColor = () => {
    if (!isPremium) {
      toast({
        title: "Premium feature",
        description: "Custom colors are only available for premium users",
        variant: "destructive",
      });
      return;
    }
    
    updateConfig("customColor", customColor);
    updateConfig("colorScheme", "custom");
  };

  const copyCurrentConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Configuration copied",
      description: "Template configuration has been copied to clipboard",
    });
  };

  // Load saved custom colors from localStorage
  useEffect(() => {
    const storedColors = localStorage.getItem('customColors');
    if (storedColors) {
      setSavedCustomColors(JSON.parse(storedColors));
    }
  }, []);

  // Save custom colors to localStorage when they change
  useEffect(() => {
    localStorage.setItem('customColors', JSON.stringify(savedCustomColors));
  }, [savedCustomColors]);

  // Handle section drag-and-drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('index', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('index'));
    const newSections = [...sections];
    const [removed] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, removed);
    setSections(newSections);
  };
  
  const moveToMain = (section: string) => {
    setSidebarSections(prev => prev.filter(s => s !== section));
    setMainSections(prev => [...prev, section]);
  };
  
  const moveToSidebar = (section: string) => {
    setMainSections(prev => prev.filter(s => s !== section));
    setSidebarSections(prev => [...prev, section]);
  };

  return (
    <Card className="w-full border-0 shadow-sm">
      <div className="mb-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-t-lg p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Template Customization</h3>
            {isPremium && <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 dark:from-amber-500 dark:to-yellow-600 dark:text-amber-50">Premium</Badge>}
          </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                    className={showAdvanced ? "border-primary" : ""}
                >
                  <Sliders className={`h-4 w-4 ${showAdvanced ? 'text-primary' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showAdvanced ? "Hide advanced options" : "Show advanced options"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyCurrentConfig}
                >
                  {copied ? <CopyCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy configuration</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleReset}
                  disabled={isSaving}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset to defaults</TooltipContent>
            </Tooltip>
          </TooltipProvider>

            <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90">
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

        {/* Quick presets navigation */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Quick Presets:</span>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
                className="h-8 px-3 flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            onClick={() => {
              updateConfig("colorScheme", "professional");
              updateConfig("font", "inter");
              updateConfig("layoutStyle", "classic");
              updateConfig("showBorders", true);
              updateConfig("sectionAlignment", {
                summary: 'left',
                experience: 'left',
                education: 'left',
                skills: 'left'
              });
            }}
          >
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-xs">Professional</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
                className="h-8 px-3 flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-900/20"
            onClick={() => {
              updateConfig("colorScheme", "minimal");
              updateConfig("font", "montserrat");
              updateConfig("layoutStyle", "modern");
              updateConfig("showBorders", false);
              updateConfig("sectionAlignment", {
                summary: 'center',
                experience: 'left',
                education: 'left',
                skills: 'left'
              });
            }}
          >
                <div className="w-3 h-3 bg-black dark:bg-white rounded-full"></div>
            <span className="text-xs">Minimalist</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
                className="h-8 px-3 flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => {
              updateConfig("colorScheme", "bold");
              updateConfig("font", "opensans");
              updateConfig("layoutStyle", "executive");
              updateConfig("showBorders", true);
              updateConfig("sectionAlignment", {
                summary: 'left',
                experience: 'left',
                education: 'left',
                skills: 'left'
              });
            }}
          >
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-xs">Bold Impact</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
                className="h-8 px-3 flex items-center gap-1 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            onClick={() => {
              updateConfig("colorScheme", "warm");
              updateConfig("font", "playfair");
              updateConfig("layoutStyle", "creative");
              updateConfig("showBorders", false);
              updateConfig("sectionAlignment", {
                summary: 'center',
                experience: 'left',
                education: 'left',
                skills: 'left'
              });
            }}
          >
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-xs">Warm Elegant</span>
          </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 flex items-center gap-1 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                onClick={() => {
                  updateConfig("colorScheme", "modern");
                  updateConfig("font", "poppins");
                  updateConfig("layoutStyle", "modern");
                  updateConfig("showBorders", false);
                  updateConfig("sectionAlignment", {
                    summary: 'left',
                    experience: 'left',
                    education: 'left',
                    skills: 'left'
                  });
                }}
              >
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                <span className="text-xs">Modern Teal</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 flex items-center gap-1 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                onClick={() => {
                  updateConfig("colorScheme", "elegant");
                  updateConfig("font", "raleway");
                  updateConfig("layoutStyle", "classic");
                  updateConfig("showBorders", true);
                  updateConfig("sectionAlignment", {
                    summary: 'left',
                    experience: 'left',
                    education: 'left',
                    skills: 'left'
                  });
                }}
              >
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-xs">Elegant</span>
              </Button>
              
              {isPremium && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-3 flex items-center gap-1 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  onClick={() => {
                    updateConfig("colorScheme", "creative");
                    updateConfig("font", "quicksand");
                    updateConfig("layoutStyle", "creative");
                    updateConfig("showBorders", true);
                    updateConfig("sectionAlignment", {
                      summary: 'center',
                      experience: 'left',
                      education: 'left',
                      skills: 'left'
                    });
                  }}
                >
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-xs">Creative</span>
                </Button>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6 p-1 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <TabsTrigger 
            value="font" 
            className="flex items-center gap-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-primary"
          >
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Typography</span>
          </TabsTrigger>
          <TabsTrigger 
            value="color" 
            className="flex items-center gap-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-primary"
          >
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Colors</span>
          </TabsTrigger>
          <TabsTrigger 
            value="layout" 
            className="flex items-center gap-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-primary"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Layout</span>
          </TabsTrigger>
          <TabsTrigger 
            value="spacing" 
            className="flex items-center gap-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-primary"
          >
            <Divide className="h-4 w-4" />
            <span className="hidden sm:inline">Spacing</span>
          </TabsTrigger>
          <TabsTrigger 
            value="sections" 
            className="flex items-center gap-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-primary"
          >
            <Columns className="h-4 w-4" />
            <span className="hidden sm:inline">Sections</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="font" className="space-y-4 px-1">
          <ScrollArea className="h-[400px] pr-4">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-medium">Font Family</h4>
                </div>
                {(isPremium || freeOptions.fonts.includes(config.font)) && (
                  <Badge variant="outline" className="text-xs font-medium bg-slate-50">
                    {fontOptions.find(f => f.id === config.font)?.name || "Default"}
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {fontOptions.map((font) => {
                  const isDisabled = !isPremium && !freeOptions.fonts.includes(font.id);
                  const isSelected = config.font === font.id;
                  
                  return (
                    <Button
                    key={font.id} 
                      variant={isSelected ? "default" : "outline"}
                      className={`h-auto py-3 px-4 justify-start ${font.className} ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                      } ${isSelected ? 'border-primary bg-primary/10 text-primary hover:bg-primary/20' : 'hover:bg-slate-50'}`}
                      onClick={() => {
                        if (!isDisabled) {
                          updateConfig("font", font.id);
                        }
                      }}
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">{font.name}</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          The quick brown fox jumps over the lazy dog
                        </span>
                        {isDisabled && (
                          <Badge variant="outline" className="mt-1 text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                            Premium
                          </Badge>
                        )}
                  </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-medium">Size & Weight</h4>
                </div>
              </div>
              
              <div className="space-y-4 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                    <Label htmlFor="heading-size" className="text-sm flex items-center gap-1">
                      <span>Heading Size</span>
                      <span className="text-xs text-muted-foreground">{config.fontSizeHeading || 100}%</span>
                    </Label>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateConfig("fontSizeHeading", Math.max(80, (config.fontSizeHeading || 100) - 5))}
                        disabled={(config.fontSizeHeading || 100) <= 80}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateConfig("fontSizeHeading", Math.min(150, (config.fontSizeHeading || 100) + 5))}
                        disabled={(config.fontSizeHeading || 100) >= 150}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                        </div>
                        <Slider
                          id="heading-size"
                    min={80}
                    max={150}
                          step={5}
                    value={[config.fontSizeHeading || 100]}
                          onValueChange={(value) => updateConfig("fontSizeHeading", value[0])}
                    className="mt-1"
                        />
                  <div className={`text-sm mt-2 ${config.font ? fontOptions.find(f => f.id === config.font)?.className : ''}`} style={{fontSize: `${(config.fontSizeHeading || 100) / 100 * 1.2}rem`}}>
                    Heading Preview
                  </div>
                      </div>
                      
                <div className="space-y-2 mt-4">
                        <div className="flex justify-between">
                    <Label htmlFor="body-size" className="text-sm flex items-center gap-1">
                      <span>Body Text Size</span>
                      <span className="text-xs text-muted-foreground">{config.fontSizeBody || 100}%</span>
                    </Label>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateConfig("fontSizeBody", Math.max(80, (config.fontSizeBody || 100) - 5))}
                        disabled={(config.fontSizeBody || 100) <= 80}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateConfig("fontSizeBody", Math.min(150, (config.fontSizeBody || 100) + 5))}
                        disabled={(config.fontSizeBody || 100) >= 150}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                        </div>
                        <Slider
                          id="body-size"
                    min={80}
                    max={150}
                          step={5}
                    value={[config.fontSizeBody || 100]}
                          onValueChange={(value) => updateConfig("fontSizeBody", value[0])}
                    className="mt-1"
                        />
                  <div className={`text-sm mt-2 ${config.font ? fontOptions.find(f => f.id === config.font)?.className : ''}`} style={{fontSize: `${(config.fontSizeBody || 100) / 100}rem`}}>
                    This is a preview of the body text at the selected size. The quick brown fox jumps over the lazy dog.
                  </div>
                </div>
              </div>
                      </div>
                      
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-medium">Font Weight</h4>
                    </div>
              </div>
                
                      <RadioGroup
                        value={config.fontWeight || "normal"}
                onValueChange={(value: any) => updateConfig("fontWeight", value)}
                className="grid grid-cols-4 gap-2"
                      >
                          <Label 
                            htmlFor="weight-light" 
                  className={`flex flex-col items-center justify-center p-3 rounded-md border cursor-pointer hover:bg-slate-50 ${
                    config.fontWeight === "light" ? "bg-primary/10 border-primary" : ""
                  }`}
                          >
                  <RadioGroupItem value="light" id="weight-light" className="sr-only" />
                  <span className={`text-lg ${config.font ? fontOptions.find(f => f.id === config.font)?.className : ''} font-light`}>Aa</span>
                  <span className="text-xs mt-1">Light</span>
                          </Label>
                
                <Label
                  htmlFor="weight-normal"
                  className={`flex flex-col items-center justify-center p-3 rounded-md border cursor-pointer hover:bg-slate-50 ${
                    config.fontWeight === "normal" || !config.fontWeight ? "bg-primary/10 border-primary" : ""
                  }`}
                >
                  <RadioGroupItem value="normal" id="weight-normal" className="sr-only" />
                  <span className={`text-lg ${config.font ? fontOptions.find(f => f.id === config.font)?.className : ''} font-normal`}>Aa</span>
                  <span className="text-xs mt-1">Normal</span>
                </Label>
                
                          <Label 
                            htmlFor="weight-medium" 
                  className={`flex flex-col items-center justify-center p-3 rounded-md border cursor-pointer hover:bg-slate-50 ${
                    config.fontWeight === "medium" ? "bg-primary/10 border-primary" : ""
                  }`}
                          >
                  <RadioGroupItem value="medium" id="weight-medium" className="sr-only" />
                  <span className={`text-lg ${config.font ? fontOptions.find(f => f.id === config.font)?.className : ''} font-medium`}>Aa</span>
                  <span className="text-xs mt-1">Medium</span>
                          </Label>
                
                <Label
                  htmlFor="weight-bold"
                  className={`flex flex-col items-center justify-center p-3 rounded-md border cursor-pointer hover:bg-slate-50 ${
                    config.fontWeight === "bold" ? "bg-primary/10 border-primary" : ""
                  }`}
                >
                  <RadioGroupItem value="bold" id="weight-bold" className="sr-only" />
                  <span className={`text-lg ${config.font ? fontOptions.find(f => f.id === config.font)?.className : ''} font-bold`}>Aa</span>
                  <span className="text-xs mt-1">Bold</span>
                </Label>
              </RadioGroup>
                    </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="color" className="space-y-4 px-1">
          <ScrollArea className="h-[400px] pr-4">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-medium">Color Scheme</h4>
                </div>
                {(isPremium || freeOptions.colorSchemes.includes(config.colorScheme)) && (
                  <Badge variant="outline" className="text-xs font-medium bg-slate-50">
                    {colorSchemes.find(c => c.id === config.colorScheme)?.name || "Default"}
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {colorSchemes.map((scheme) => {
                  const isDisabled = !isPremium && !freeOptions.colorSchemes.includes(scheme.id);
                  const isSelected = config.colorScheme === scheme.id;
                  
                  return (
                    <Button
                    key={scheme.id} 
                      variant="outline"
                      className={`h-auto p-0 overflow-hidden flex flex-col items-stretch ${
                        isDisabled ? 'opacity-60 cursor-not-allowed' : ''
                      } ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                      onClick={() => {
                        if (!isDisabled) {
                          updateConfig("colorScheme", scheme.id);
                        }
                      }}
                    >
                      <div className={`h-2 w-full ${scheme.primary}`}></div>
                      <div className="p-3 text-center">
                        <span className="text-xs font-medium">{scheme.name}</span>
                        {isDisabled && (
                          <Badge variant="outline" className="ml-1 text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                            Premium
                          </Badge>
                        )}
                    </div>
                    </Button>
                  );
                })}
                  </div>
              
              {savedCustomColors.length > 0 && (
                <div className="mt-4 mb-6">
                  <h4 className="text-sm font-medium mb-2">Saved Custom Colors</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {savedCustomColors.map((customScheme) => (
                      <Button
                        key={customScheme.id} 
                        variant="outline"
                        className={`h-auto p-0 overflow-hidden flex flex-col items-stretch ${
                          config.colorScheme === customScheme.id ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                        onClick={() => updateConfig("colorScheme", customScheme.id)}
                      >
                        <div className="h-2 w-full" style={{ backgroundColor: customScheme.color }}></div>
                        <div className="p-2 text-center">
                          <span className="text-xs font-medium">{customScheme.name}</span>
                          </div>
                      </Button>
                    ))}
                        </div>
                      </div>
                )}
            </div>

            {/* Custom color creator */}
            {isPremium && (
              <div className="mb-6 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-medium">Create Custom Color</h4>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-4">
                <div className="flex justify-center">
                  <HexColorPicker 
                    color={customColor} 
                    onChange={setCustomColor} 
                    style={{ width: '100%', height: '120px' }}
                  />
                </div>
                
                  <div className="flex space-x-3 items-center">
                  <div 
                      className="w-10 h-10 rounded-md border shadow-sm"
                    style={{ backgroundColor: customColor }}
                  ></div>
                  <Input 
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                      className="flex-1 h-9 text-sm"
                  />
                </div>
                
                  <div className="flex space-x-2 items-center">
                  <Input 
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                      placeholder="Color name"
                      className="flex-1 h-9 text-sm"
                  />
                  <Button 
                    onClick={saveCustomColor}
                      className="h-9"
                  >
                      Save Color
                  </Button>
                  </div>
                  
                  <div className="flex justify-center mt-2">
                  <Button 
                      variant="outline"
                    onClick={applyCustomColor}
                      className="h-9 w-full"
                  >
                      Apply Without Saving
                  </Button>
                  </div>
                </div>
              </div>
            )}
            
            {!isPremium && (
              <div className="p-4 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-800 dark:text-amber-400">Premium Feature</h4>
                    <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                      Upgrade to premium to create and save custom colors for your resume.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4 px-1">
          <ScrollArea className="h-[400px] pr-4">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-medium">Layout Style</h4>
                </div>
                <Badge variant="outline" className="text-xs font-medium bg-slate-50">
                  {layoutStyles.find(l => l.id === config.layoutStyle)?.name || "Classic"}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {layoutStyles.map((style) => {
                  const isSelected = config.layoutStyle === style.id;
                  
                  return (
                    <Button
                      key={style.id}
                      variant={isSelected ? "default" : "outline"}
                      className={`h-auto py-3 px-4 justify-start ${
                        isSelected ? 'border-primary bg-primary/10 text-primary hover:bg-primary/20' : 'hover:bg-slate-50'
                      }`}
                      onClick={() => updateConfig("layoutStyle", style.id)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">{style.name}</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {style.description}
                        </span>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sidebar className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-medium">Sidebar Options</h4>
                </div>
              </div>
              
              <div className="space-y-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor="use-sidebar" className="text-sm flex items-center gap-2">
                    <span>Use Accent Sidebar</span>
                    {config.useAccentSidebar && (
                      <Badge variant="outline" className="text-xs">Enabled</Badge>
                    )}
                    </Label>
                  <Switch
                    id="use-sidebar"
                    checked={config.useAccentSidebar || false}
                    onCheckedChange={(checked) => updateConfig("useAccentSidebar", checked)}
                  />
                  </div>
                  
                {config.useAccentSidebar && (
                  <>
                    <div className="space-y-2 pt-2">
                      <Label className="text-sm">Sidebar Width</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={config.sidebarWidth === 'narrow' ? "default" : "outline"}
                          size="sm"
                          className={`h-auto py-2 ${config.sidebarWidth === 'narrow' ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}`}
                          onClick={() => updateConfig("sidebarWidth", "narrow")}
                        >
                          Narrow
                        </Button>
                        <Button
                          variant={config.sidebarWidth === 'medium' || !config.sidebarWidth ? "default" : "outline"}
                          size="sm"
                          className={`h-auto py-2 ${config.sidebarWidth === 'medium' || !config.sidebarWidth ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}`}
                          onClick={() => updateConfig("sidebarWidth", "medium")}
                        >
                          Medium
                        </Button>
                        <Button
                          variant={config.sidebarWidth === 'wide' ? "default" : "outline"}
                          size="sm"
                          className={`h-auto py-2 ${config.sidebarWidth === 'wide' ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}`}
                          onClick={() => updateConfig("sidebarWidth", "wide")}
                        >
                          Wide
                        </Button>
                  </div>
              </div>
              
                    <div className="space-y-2 pt-2">
                      <Label className="text-sm">Sidebar Position</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={config.sidebarPosition === 'left' ? "default" : "outline"}
                          size="sm"
                          className={`h-auto py-2 ${config.sidebarPosition === 'left' ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}`}
                          onClick={() => updateConfig("sidebarPosition", "left")}
                        >
                          <PanelLeft className="h-4 w-4 mr-2" />
                          Left
                        </Button>
                        <Button
                          variant={config.sidebarPosition === 'right' || !config.sidebarPosition ? "default" : "outline"}
                          size="sm"
                          className={`h-auto py-2 ${config.sidebarPosition === 'right' || !config.sidebarPosition ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}`}
                          onClick={() => updateConfig("sidebarPosition", "right")}
                        >
                          <PanelRight className="h-4 w-4 mr-2" />
                          Right
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Divide className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-medium">Section Dividers</h4>
                </div>
              </div>
              
              <div className="space-y-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor="use-dividers" className="text-sm flex items-center gap-2">
                    <span>Show Section Dividers</span>
                    {config.showBorders && (
                      <Badge variant="outline" className="text-xs">Enabled</Badge>
                    )}
                      </Label>
                  <Switch
                    id="use-dividers"
                    checked={config.showBorders || false}
                    onCheckedChange={(checked) => updateConfig("showBorders", checked)}
                  />
                    </div>
                    
                {config.showBorders && config.dividerStyle && (
                  <div className="space-y-2 pt-2">
                    <Label className="text-sm">Divider Style</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={config.dividerStyle === 'solid' || !config.dividerStyle ? "default" : "outline"}
                        size="sm"
                        className={`h-auto py-2 ${config.dividerStyle === 'solid' || !config.dividerStyle ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}`}
                        onClick={() => updateConfig("dividerStyle", "solid")}
                      >
                        Solid
                      </Button>
                      <Button
                        variant={config.dividerStyle === 'dashed' ? "default" : "outline"}
                        size="sm"
                        className={`h-auto py-2 ${config.dividerStyle === 'dashed' ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}`}
                        onClick={() => updateConfig("dividerStyle", "dashed")}
                      >
                        Dashed
                      </Button>
                      <Button
                        variant={config.dividerStyle === 'dotted' ? "default" : "outline"}
                        size="sm"
                        className={`h-auto py-2 ${config.dividerStyle === 'dotted' ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}`}
                        onClick={() => updateConfig("dividerStyle", "dotted")}
                      >
                        Dotted
                      </Button>
                    </div>
                </div>
              )}
            </div>
          </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-medium">Additional Options</h4>
                </div>
              </div>
              
              <div className="space-y-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor="use-icons" className="text-sm">Use Icons in Sections</Label>
                  <Switch
                    id="use-icons"
                    checked={config.useIcons || false}
                    onCheckedChange={(checked) => updateConfig("useIcons", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="use-columns" className="text-sm">Use Column Layout</Label>
                  <Switch
                    id="use-columns"
                    checked={config.useColumns || false}
                    onCheckedChange={(checked) => updateConfig("useColumns", checked)}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="spacing" className="space-y-4">
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="spacing-global" className="text-sm font-medium">Global Spacing</Label>
                  <span className="text-xs">{config.spacingScale || 100}%</span>
                </div>
                <Slider
                  id="spacing-global"
                  disabled={!isPremium && !freeOptions.spacing}
                  value={[config.spacingScale || 100]}
                  min={80}
                  max={120}
                  step={5}
                  onValueChange={(value) => updateConfig("spacingScale", value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Adjust the overall spacing of your resume
                </p>
                {!isPremium && !freeOptions.spacing && (
                  <p className="text-xs text-yellow-600">Spacing adjustments are a premium feature</p>
                )}
              </div>
              
              {showAdvanced && (
                <Accordion type="single" collapsible>
                  <AccordionItem value="section-spacing">
                    <AccordionTrigger className="text-sm">Section Spacing</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="spacing-sections" className="text-sm">Between Sections</Label>
                            <span className="text-xs">{config.spacingSections || 100}%</span>
                          </div>
                          <Slider
                            id="spacing-sections"
                            disabled={!isPremium}
                            value={[config.spacingSections || 100]}
                            min={70}
                            max={150}
                            step={10}
                            onValueChange={(value) => updateConfig("spacingSections", value[0])}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="spacing-elements" className="text-sm">Between Elements</Label>
                            <span className="text-xs">{config.spacingElements || 100}%</span>
                          </div>
                          <Slider
                            id="spacing-elements"
                            disabled={!isPremium}
                            value={[config.spacingElements || 100]}
                            min={70}
                            max={150}
                            step={10}
                            onValueChange={(value) => updateConfig("spacingElements", value[0])}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="margin-padding">
                    <AccordionTrigger className="text-sm">Margins & Padding</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="page-margin" className="text-sm">Page Margins</Label>
                            <span className="text-xs">{config.pageMargin || 'Normal'}</span>
                          </div>
                          <RadioGroup
                            value={config.pageMargin || "normal"}
                            onValueChange={(value) => updateConfig("pageMargin", value)}
                            className="flex space-x-2"
                            disabled={!isPremium}
                          >
                            <div className="flex items-center">
                              <RadioGroupItem value="narrow" id="margin-narrow" />
                              <Label htmlFor="margin-narrow" className="ml-1 text-xs">Narrow</Label>
                            </div>
                            <div className="flex items-center">
                              <RadioGroupItem value="normal" id="margin-normal" />
                              <Label htmlFor="margin-normal" className="ml-1 text-xs">Normal</Label>
                            </div>
                            <div className="flex items-center">
                              <RadioGroupItem value="wide" id="margin-wide" />
                              <Label htmlFor="margin-wide" className="ml-1 text-xs">Wide</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Preset Spacing Styles</h4>
                <div className="grid grid-cols-2 gap-2">
                  {spacingOptions.map((option) => (
                    <Button
                      key={option.id}
                      variant={config.spacingPreset === option.id ? "default" : "outline"}
                      size="sm"
                      className="justify-start"
                      onClick={() => {
                        if (!isPremium && option.premium) {
                          toast({
                            title: "Premium Feature",
                            description: "This spacing preset is only available for premium users",
                            variant: "destructive",
                          });
                          return;
                        }
                        updateConfig("spacingPreset", option.id);
                      }}
                      disabled={!isPremium && option.premium}
                    >
                      <span className="mr-2">{option.icon}</span>
                      <span>{option.name}</span>
                      {!isPremium && option.premium && (
                        <span className="ml-auto text-xs text-yellow-600">Premium</span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Section Arrangement</h3>
                  {isPremium && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSectionReorderMode(!sectionReorderMode)}
                    >
                      {sectionReorderMode ? "Done" : "Reorder"}
                    </Button>
                  )}
                </div>
                
                {!isPremium && (
                  <div className="text-sm text-muted-foreground bg-yellow-50 border border-yellow-200 rounded-md p-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 mb-1">Premium</Badge>
                    <p>Upgrade to Premium to customize section order and layout.</p>
                  </div>
                )}
                
                {isPremium && sectionReorderMode && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Drag sections to reorder them:</p>
                    <div className="space-y-1 border rounded-md p-2">
                      {sections.map((section, index) => (
                        <div 
                          key={section}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded border cursor-move hover:bg-gray-100"
                        >
                          <span className="capitalize">{section}</span>
                          <MoveVertical className="h-4 w-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {isPremium && !sectionReorderMode && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Switch
                          checked={config.useAccentSidebar}
                          onCheckedChange={(checked) => updateConfig("useAccentSidebar", checked)}
                        />
                        Use accent sidebar
                      </Label>
                      
                      {config.useAccentSidebar && (
                        <div className="pl-7 space-y-2">
                          <Label>Sidebar width</Label>
                          <RadioGroup 
                            value={config.sidebarWidth || "medium"} 
                            onValueChange={(value) => updateConfig("sidebarWidth", value)}
                            className="flex space-x-2"
                          >
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="narrow" id="narrow" />
                              <Label htmlFor="narrow" className="text-xs">Narrow</Label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="medium" id="medium" />
                              <Label htmlFor="medium" className="text-xs">Medium</Label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="wide" id="wide" />
                              <Label htmlFor="wide" className="text-xs">Wide</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}
                    </div>
                    
                    {config.useAccentSidebar && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium mt-4">Section Placement</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                              <PanelLeft className="h-4 w-4" />
                              Sidebar Sections
                            </Label>
                            <div className="border rounded-md p-2 bg-gray-50 min-h-[100px] text-sm">
                              {sidebarSections.map((section) => (
                                <div key={section} className="flex justify-between items-center p-1.5 border-b last:border-0">
                                  <span className="capitalize">{section}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0"
                                    onClick={() => moveToMain(section)}
                                  >
                                    <ArrowLeftRight className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                              <PanelRight className="h-4 w-4" />
                              Main Sections
                            </Label>
                            <div className="border rounded-md p-2 bg-gray-50 min-h-[100px] text-sm">
                              {mainSections.map((section) => (
                                <div key={section} className="flex justify-between items-center p-1.5 border-b last:border-0">
                                  <span className="capitalize">{section}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0"
                                    onClick={() => moveToSidebar(section)}
                                  >
                                    <ArrowLeftRight className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium mt-4">Section Alignment</h4>
                      <div className="space-y-2">
                        {sections.map((section) => (
                          <div key={section} className="flex items-center justify-between border-b pb-2">
                            <Label className="capitalize">{section}</Label>
                            <div className="flex space-x-1">
                              <Button
                                variant={config.sectionAlignment?.[section] === 'left' ? "secondary" : "outline"}
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => updateConfig("sectionAlignment", {
                                  ...config.sectionAlignment,
                                  [section]: 'left'
                                })}
                              >
                                <AlignLeft className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={config.sectionAlignment?.[section] === 'center' ? "secondary" : "outline"}
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => updateConfig("sectionAlignment", {
                                  ...config.sectionAlignment,
                                  [section]: 'center'
                                })}
                              >
                                <AlignCenter className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={config.sectionAlignment?.[section] === 'right' ? "secondary" : "outline"}
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => updateConfig("sectionAlignment", {
                                  ...config.sectionAlignment,
                                  [section]: 'right'
                                })}
                              >
                                <AlignRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium mt-4">Section Dividers</h4>
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Switch
                            checked={config.useDividers}
                            onCheckedChange={(checked) => updateConfig("useDividers", checked)}
                          />
                          Use dividers between sections
                        </Label>
                        
                        {config.useDividers && (
                          <div className="pl-7">
                            <Label>Divider style</Label>
                            <RadioGroup 
                              value={config.dividerStyle || "solid"} 
                              onValueChange={(value) => updateConfig("dividerStyle", value)}
                              className="flex space-x-4 mt-1"
                            >
                              <div className="flex items-center space-x-1">
                                <RadioGroupItem value="solid" id="solid" />
                                <Label htmlFor="solid" className="text-xs">Solid</Label>
                              </div>
                              <div className="flex items-center space-x-1">
                                <RadioGroupItem value="dashed" id="dashed" />
                                <Label htmlFor="dashed" className="text-xs">Dashed</Label>
                              </div>
                              <div className="flex items-center space-x-1">
                                <RadioGroupItem value="dotted" id="dotted" />
                                <Label htmlFor="dotted" className="text-xs">Dotted</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Switch
                          checked={config.useIcons}
                          onCheckedChange={(checked) => updateConfig("useIcons", checked)}
                        />
                        Use section icons
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
} 