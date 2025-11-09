import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  Camera,
  Loader2,
  CheckCircle2,
  Trash2,
  Eye,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import detectionService from "@/services/detectionService";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Detection() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detectionToDelete, setDetectionToDelete] = useState(null);
  const { toast } = useToast();

  // Load history and statistics on component mount
  useEffect(() => {
    fetchHistory();
    fetchStatistics();
  }, []);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await detectionService.getHistory();
      setHistory(data.results || data); // Handle paginated or direct response
    } catch (error) {
      console.error("Failed to fetch history:", error);
      toast({
        title: "Failed to load history",
        description: "Could not load detection history",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const data = await detectionService.getStatistics();
      setStatistics(data);
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null); // Clear previous result

      toast({
        title: "Image uploaded",
        description: "Ready for disease detection",
      });
    }
  };

  const handleDetect = async () => {
    if (!image) {
      toast({
        title: "No image",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    setIsDetecting(true);
    setResult(null);

    try {
      const response = await detectionService.detectDisease(image);

      setResult({
        detection_id: response.detection_id,
        disease: response.disease,
        confidence: response.confidence,
        confidence_percentage: response.confidence_percentage,
        top_predictions: response.top_predictions,
        disease_info: response.disease_info,
        detected_at: response.detected_at,
        image_url: response.image_url,
      });

      toast({
        title: "Detection complete",
        description: `Detected: ${response.disease.replace(/_/g, " ")}`,
      });

      // Refresh history and statistics
      fetchHistory();
      fetchStatistics();
    } catch (error) {
      console.error("Detection error:", error);
      toast({
        title: "Detection failed",
        description: error.error || "An error occurred during detection",
        variant: "destructive",
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleDeleteDetection = async (detectionId) => {
    try {
      await detectionService.deleteDetection(detectionId);

      toast({
        title: "Deleted",
        description: "Detection record deleted successfully",
      });

      // Refresh history and statistics
      fetchHistory();
      fetchStatistics();

      // Clear result if it's the current one
      if (result && result.detection_id === detectionId) {
        setResult(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: "Could not delete detection record",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDetectionToDelete(null);
    }
  };

  const confirmDelete = (detection) => {
    setDetectionToDelete(detection);
    setDeleteDialogOpen(true);
  };

  const viewDetection = (detection) => {
    setResult({
      detection_id: detection.id,
      disease:
        detection.disease_details?.name || detection.disease || "Unknown",
      confidence: detection.confidence,
      confidence_percentage: `${(detection.confidence * 100).toFixed(2)}%`,
      top_predictions: [],
      disease_info: detection.disease_details || {
        crop_type: "Unknown",
        symptoms: "No information available",
        treatment: "No information available",
        prevention: "No information available",
      },
      detected_at: detection.detected_at,
      image_url: detection.image,
    });
    setImagePreview(detection.image);
  };

  const triggerFileInput = () => {
    document.getElementById("image-upload")?.click();
  };

  const resetDetection = () => {
    setImage(null);
    setImagePreview(null);
    setResult(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getConfidenceColor = (confidence) => {
    const percentage = confidence * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Disease Detection
            </h1>
            <p className="text-muted-foreground mt-1">
              Upload crop images for AI-powered disease analysis
            </p>
          </div>

          {statistics && (
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {statistics.total_detections}
                </p>
                <p className="text-xs text-muted-foreground">Total Scans</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {statistics.average_confidence_percentage}
                </p>
                <p className="text-xs text-muted-foreground">Avg Confidence</p>
              </div>
            </div>
          )}
        </div>

        {/* Upload + Results Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>
                Select an image for disease detection (max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  onChange={handleImageUpload}
                />

                {/* Upload Area */}
                <div
                  onClick={triggerFileInput}
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/10 p-12 transition-colors hover:bg-muted/20 cursor-pointer"
                >
                  {imagePreview ? (
                    <div className="space-y-4 w-full">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg object-contain"
                      />
                      <p className="text-sm text-center text-muted-foreground">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-sm font-medium text-foreground">
                        Drop your image here
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        or click to browse
                      </p>
                      <Button variant="outline" className="mt-4" type="button">
                        <Camera className="mr-2 h-4 w-4" />
                        Select Image
                      </Button>
                    </>
                  )}
                </div>

                {/* Detect Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleDetect}
                  disabled={isDetecting || !image}
                >
                  {isDetecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Detect Disease"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>Detection Result</CardTitle>
              <CardDescription>AI analysis results</CardDescription>
            </CardHeader>
            <CardContent>
              {isDetecting ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Analyzing crop health...
                  </p>
                  <div className="w-full">
                    <Progress value={66} className="w-full" />
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  {/* Main Result */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {result.disease.replace(/_/g, " ")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {result.disease_info.crop_type}
                      </p>
                    </div>
                  </div>

                  {/* Confidence Score */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        Confidence
                      </span>
                      <span
                        className={`text-sm font-bold ${getConfidenceColor(
                          result.confidence
                        )}`}
                      >
                        {result.confidence_percentage}
                      </span>
                    </div>
                    <Progress value={result.confidence * 100} className="h-2" />
                  </div>

                  {/* Top Predictions */}
                  {result.top_predictions &&
                    result.top_predictions.length > 1 && (
                      <div className="rounded-lg bg-muted p-4">
                        <h4 className="text-sm font-semibold text-foreground mb-2">
                          Alternative Predictions
                        </h4>
                        <div className="space-y-2">
                          {result.top_predictions
                            .slice(1, 3)
                            .map((pred, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-muted-foreground">
                                  {pred.disease.replace(/_/g, " ")}
                                </span>
                                <span className="font-medium">
                                  {(pred.confidence * 100).toFixed(1)}%
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Disease Information */}
                  <div className="space-y-3">
                    <div className="rounded-lg bg-muted p-4">
                      <h4 className="text-sm font-semibold text-foreground mb-2">
                        Symptoms
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {result.disease_info.symptoms}
                      </p>
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                      <h4 className="text-sm font-semibold text-foreground mb-2">
                        Treatment
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {result.disease_info.treatment}
                      </p>
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                      <h4 className="text-sm font-semibold text-foreground mb-2">
                        Prevention
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {result.disease_info.prevention}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={resetDetection}
                  >
                    Analyze Another Image
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No analysis yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload an image to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        {statistics &&
          statistics.most_common_diseases &&
          statistics.most_common_diseases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Most Common Diseases
                </CardTitle>
                <CardDescription>
                  Your most frequently detected diseases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statistics.most_common_diseases.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{idx + 1}</Badge>
                        <p className="font-medium text-foreground">
                          {item.disease.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {item.count} time{item.count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* History Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Detection History</CardTitle>
                <CardDescription>Your previous analyses</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchHistory}
                disabled={isLoadingHistory}
              >
                {isLoadingHistory ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  No detection history yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your detection history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-border last:border-0 hover:bg-muted/50 rounded-lg p-2 transition-colors mb-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* <img
                        src={item.image}
                        alt="Detection"
                        className="h-12 w-12 rounded object-cover"
                      /> */}
                      <div>
                        <p className="font-medium text-foreground">
                          {item.disease_details?.name?.replace(/_/g, " ") ||
                            "Unknown Disease"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(item.detected_at)}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getConfidenceColor(
                              item.confidence
                            )}`}
                          >
                            {(item.confidence * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewDetection(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmDelete(item)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Detection?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              detection record from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteDetection(detectionToDelete?.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
