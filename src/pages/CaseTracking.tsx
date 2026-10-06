import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, FileText, Calendar, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CaseStatus {
  caseNumber: string;
  caseName: string;
  status: string;
  nextHearing: string;
  court: string;
  stage: string;
  lastUpdated: string;
}

const CaseTracking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  const [caseData, setCaseData] = useState<CaseStatus | null>(null);

  // Search form fields
  const [caseType, setCaseType] = useState("cnr");
  const [caseNumber, setCaseNumber] = useState("");
  const [caseYear, setCaseYear] = useState("");
  const [state, setState] = useState("delhi");

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleSearch = async () => {
    if (!caseNumber) {
      toast({
        title: "Missing Information",
        description: "Please enter a case number.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      // Simulate API call to E-Courts (in real implementation, call actual E-Courts API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock case data
      setCaseData({
        caseNumber: caseNumber,
        caseName: "Ram Kumar vs. State",
        status: "Pending",
        nextHearing: "15th November 2025",
        court: "District Court, Delhi",
        stage: "Arguments Stage",
        lastUpdated: new Date().toLocaleDateString(),
      });

      toast({
        title: "Case Found!",
        description: "Case details have been retrieved successfully.",
      });
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Failed",
        description: "Could not find case. Please verify case number.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Track Your Case</h1>
          <p className="text-muted-foreground">
            Check case status and hearing dates from E-Courts
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This feature connects to the E-Courts portal to fetch real-time case status.
            CNR (Case Number Reference) is recommended for accurate results.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Search Case</CardTitle>
            <CardDescription>
              Enter your case details to track status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="caseType">Search By</Label>
              <Select value={caseType} onValueChange={setCaseType}>
                <SelectTrigger id="caseType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cnr">CNR Number (Recommended)</SelectItem>
                  <SelectItem value="filing">Filing Number</SelectItem>
                  <SelectItem value="case">Case Number</SelectItem>
                  <SelectItem value="party">Party Name</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                CNR is a unique 16-digit number found on court orders
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="state">State/UT</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger id="state">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delhi">Delhi</SelectItem>
                    <SelectItem value="mumbai">Maharashtra</SelectItem>
                    <SelectItem value="bangalore">Karnataka</SelectItem>
                    <SelectItem value="chennai">Tamil Nadu</SelectItem>
                    <SelectItem value="kolkata">West Bengal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {caseType !== "cnr" && (
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2025"
                    value={caseYear}
                    onChange={(e) => setCaseYear(e.target.value)}
                    min="2000"
                    max="2030"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseNumber">
                {caseType === "cnr" && "CNR Number"}
                {caseType === "filing" && "Filing Number"}
                {caseType === "case" && "Case Number"}
                {caseType === "party" && "Party Name"}
              </Label>
              <Input
                id="caseNumber"
                placeholder={
                  caseType === "cnr"
                    ? "e.g., DLCT01-123456-2025"
                    : caseType === "party"
                    ? "Enter party name"
                    : "Enter number"
                }
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                required
              />
            </div>

            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full"
              size="lg"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Search Case
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <a
                href="https://services.ecourts.gov.in/ecourtindia_v6/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit E-Courts Portal
              </a>
            </Button>
          </CardContent>
        </Card>

        {caseData && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Case Details</CardTitle>
                  <CardDescription>
                    Last updated: {caseData.lastUpdated}
                  </CardDescription>
                </div>
                <Badge variant={caseData.status === "Pending" ? "default" : "secondary"}>
                  {caseData.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Case Number</p>
                  <p className="font-medium">{caseData.caseNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Case Name</p>
                  <p className="font-medium">{caseData.caseName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Court</p>
                  <p className="font-medium">{caseData.court}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Current Stage</p>
                  <p className="font-medium">{caseData.stage}</p>
                </div>
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Next Hearing Date</p>
                      <p className="text-xl font-bold text-primary">{caseData.nextHearing}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Please verify all details on the official E-Courts
                  portal. Attend all hearings with required documents.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button className="flex-1" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  View Orders
                </Button>
                <Button className="flex-1" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Set Reminder
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CaseTracking;
