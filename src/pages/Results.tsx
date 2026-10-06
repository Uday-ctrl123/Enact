import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Scale,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Download,
  Share2,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generatePDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

const Results = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { toast } = useToast();

  const handleDownloadPDF = () => {
    const content = document.querySelector(".results-content")?.innerHTML || "";
    try {
      generatePDF(`Legal Guidance - ${query}`, content);
      toast({
        title: "PDF Generated",
        description: "Your legal guidance document is being prepared for download.",
      });
    } catch (_error) {
      toast({
        title: "Download Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Legal Guidance - ${query}`,
          text: `Get legal guidance for: ${query}`,
          url: window.location.href,
        });
      } catch (_error) {
        // User cancelled share
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Page link copied to clipboard!",
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div
        className="results-content container max-w-4xl"
        role="main"
        aria-label="Legal guidance results"
      >
        {/* Empathy Statement */}
        <Card className="mb-6 border-l-4 border-l-secondary bg-gradient-card">
          <CardContent className="pt-6">
            <p className="text-lg">
              We understand dealing with legal issues can be stressful. Let's work through this
              together and find the right path forward for you.
            </p>
          </CardContent>
        </Card>

        {/* Your Situation */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <CardTitle>Your Situation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="mb-2 text-sm font-medium text-muted-foreground">You're asking about:</p>
              <p className="text-base">{query}</p>
            </div>
            <p>
              Based on your query, this appears to be a matter involving consumer rights and civil
              remedies. Let me help you understand your legal position and the steps you can take.
            </p>
          </CardContent>
        </Card>

        {/* The Laws That Protect You */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>The Laws That Protect You</CardTitle>
            <CardDescription>Based on BNS, BSA, and BNSS 2023</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-start gap-3">
                  <Badge className="mt-1">BNS §420</Badge>
                  <div className="flex-1">
                    <h4 className="mb-1 font-semibold">
                      Cheating and Dishonestly Inducing Delivery of Property
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      This section protects you if someone has deceived you into parting with money
                      or property. It covers situations where false promises were made with intent
                      to cheat.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    BNSS §173
                  </Badge>
                  <div className="flex-1">
                    <h4 className="mb-1 font-semibold">Filing a First Information Report (FIR)</h4>
                    <p className="text-sm text-muted-foreground">
                      You have the right to file an FIR at any police station. The police are
                      legally required to register your complaint if it involves a cognizable
                      offense.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    BSA §65
                  </Badge>
                  <div className="flex-1">
                    <h4 className="mb-1 font-semibold">Documentary Evidence</h4>
                    <p className="text-sm text-muted-foreground">
                      All written agreements, receipts, messages, and digital communications can
                      serve as evidence. Keep all documentation safe.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Legal Rights */}
        <Card className="mb-6 border-l-4 border-l-success">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Your Legal Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span>You have the right to file a criminal complaint for cheating and fraud</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span>You can demand the return of your money with legal interest</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span>You may claim compensation for mental harassment and financial loss</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span>Legal aid services are available free of cost if needed</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Step-by-Step Action Plan */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Action Plan</CardTitle>
            <CardDescription>Follow these steps in order for the best outcome</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Immediate Actions */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                    1
                  </div>
                  <h3 className="text-lg font-semibold">Immediate Actions (This Week)</h3>
                </div>
                <div className="ml-10 space-y-4">
                  <div className="rounded-lg border bg-card p-4">
                    <h4 className="mb-2 font-medium">📝 Gather All Evidence</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Original agreement or contract documents</li>
                      <li>• Payment receipts, bank statements, transaction records</li>
                      <li>• All communication (emails, WhatsApp, SMS)</li>
                      <li>• Witness contact information</li>
                      <li>• Photos or videos if relevant</li>
                    </ul>
                    <p className="mt-2 text-sm">
                      <strong>Why:</strong> Strong evidence is crucial for your case
                    </p>
                  </div>

                  <div className="rounded-lg border bg-card p-4">
                    <h4 className="mb-2 font-medium">📧 Send a Legal Notice</h4>
                    <p className="mb-2 text-sm text-muted-foreground">
                      Send a formal notice demanding return of money within 15 days
                    </p>
                    <div className="mt-2 rounded bg-muted p-2 text-sm">
                      <strong>Where:</strong> Registered post or through a lawyer
                      <br />
                      <strong>Cost:</strong> ₹500-2,000 (lawyer fees)
                      <br />
                      <strong>Timeline:</strong> 2-3 days to prepare and send
                    </div>
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <Link to="/documents">
                        Get Legal Notice Template <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Short-term Steps */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                    2
                  </div>
                  <h3 className="text-lg font-semibold">Short-Term Steps (Next 2-4 Weeks)</h3>
                </div>
                <div className="ml-10 space-y-4">
                  <div className="rounded-lg border bg-card p-4">
                    <h4 className="mb-2 font-medium">🚔 File an FIR</h4>
                    <p className="mb-2 text-sm text-muted-foreground">
                      If the other party doesn't respond or refuses to pay, file a criminal
                      complaint
                    </p>
                    <div className="mt-2 space-y-1 rounded bg-muted p-2 text-sm">
                      <div>
                        <strong>Where:</strong> Nearest police station or cyber crime cell
                      </div>
                      <div>
                        <strong>What to bring:</strong> All evidence, 2 ID proofs, 2 witnesses
                      </div>
                      <div>
                        <strong>Cost:</strong> Free (no charges for FIR)
                      </div>
                      <div>
                        <strong>Timeline:</strong> FIR registered same day
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <Link to="/resources">
                        Find Nearest Police Station <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="rounded-lg border bg-card p-4">
                    <h4 className="mb-2 font-medium">⚖️ Consider Consumer Court</h4>
                    <p className="mb-2 text-sm text-muted-foreground">
                      For civil remedy and compensation (parallel to criminal case)
                    </p>
                    <div className="mt-2 rounded bg-muted p-2 text-sm">
                      <strong>Timeline:</strong> Cases typically resolve in 3-6 months
                      <br />
                      <strong>Cost:</strong> Court fee based on claim amount
                      <br />
                      <strong>Note:</strong> You can file this yourself or with a lawyer
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Medium-term Process */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    3
                  </div>
                  <h3 className="text-lg font-semibold">Follow-Up & Resolution (1-6 Months)</h3>
                </div>
                <div className="ml-10 space-y-4">
                  <div className="rounded-lg border bg-card p-4">
                    <h4 className="mb-2 font-medium">Track Your Case</h4>
                    <p className="text-sm text-muted-foreground">
                      Monitor progress through E-Courts portal. Attend hearings with all documents.
                      Consider mediation if other party shows willingness to settle.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Warnings */}
        <Alert className="mb-6 border-l-4 border-l-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <strong className="mb-2 block">Important Warnings:</strong>
            <ul className="space-y-1 text-sm">
              <li>• Time limit: File FIR within 3 years of the incident</li>
              <li>• Don't make any payments without proper receipts</li>
              <li>• Avoid any informal "settlements" without written agreement</li>
              <li>• Keep all communication professional and documented</li>
              <li>• Consult a lawyer before signing any new documents</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Resources */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Helpful Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/resources">
                <Phone className="mr-2 h-4 w-4" />
                Legal Aid Helpline: 1800-123-4567
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/resources">
                <Phone className="mr-2 h-4 w-4" />
                Cyber Crime Helpline: 1930
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/chat">
                <MessageSquare className="mr-2 h-4 w-4" />
                Ask Follow-up Questions in Chat
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Bottom Actions */}
        <div className="sticky bottom-4 flex justify-center gap-3 rounded-lg border bg-background/80 p-4 shadow-lg backdrop-blur">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            aria-label="Download legal guidance as PDF"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            aria-label="Share this legal guidance"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button size="sm" asChild>
            <Link to="/chat" aria-label="Continue conversation in chat">
              <MessageSquare className="mr-2 h-4 w-4" />
              Continue in Chat
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
