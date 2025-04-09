"use client";

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Cross2Icon, CheckIcon, ReloadIcon } from "@radix-ui/react-icons";

export default function DebugPage() {
  const [apiUrl, setApiUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [urlTestResults, setUrlTestResults] = useState(null);
  const [soapTestResults, setSoapTestResults] = useState(null);
  const [oneCAuthResults, setOneCAuthResults] = useState(null);
  const [webInterfaceResults, setWebInterfaceResults] = useState(null);
  const [testResults, setTestResults] = useState(null);

  // Load environment variables on mount (from window.__ENV__)
  useEffect(() => {
    async function getEnvVars() {
      try {
        const response = await fetch('/api/env');
        const data = await response.json();
        if (data.ULTRA_API_URL) setApiUrl(data.ULTRA_API_URL);
        if (data.LOGIN) setUsername(data.LOGIN);
        if (data.PASSWORD) setPassword(data.PASSWORD);
      } catch (err) {
        console.error('Failed to load environment variables:', err);
      }
    }

    getEnvVars();

    // Run URL test on load
    testUrl();
  }, []);

  async function testUrl() {
    setLoading(true);
    setUrlTestResults(null);
    setError(null);

    try {
      const response = await fetch('/api/test-url');
      const data = await response.json();
      setUrlTestResults('Check the server logs for test results.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function testSoapConnection() {
    try {
      setTestResults({ loading: true });
      const response = await fetch('/api/test-soap', {
        method: 'POST',
      });
      const data = await response.json();

      // Enhanced results display
      const enhancedResults = {
        ...data,
        details: [
          {
            step: 'WSDL URL',
            message: process.env.NEXT_PUBLIC_ULTRA_API_URL || 'Not configured',
          },
          ...(data.details || []),
        ],
      };

      setTestResults(enhancedResults);
    } catch (error) {
      setTestResults({
        success: false,
        error: error.message,
      });
    }
  }

  async function testHttpRequest() {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/manual-soap-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: apiUrl,
          username,
          password
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function test1CAuth() {
    setLoading(true);
    setOneCAuthResults(null);
    setError(null);

    try {
      const response = await fetch('/api/test-1c-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: apiUrl,
          username,
          password
        }),
      });

      const data = await response.json();
      setOneCAuthResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function testWebInterface() {
    setLoading(true);
    setWebInterfaceResults(null);
    setError(null);

    try {
      const response = await fetch('/api/test-web-interface');
      const data = await response.json();
      setWebInterfaceResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateApiUrlSetting(url) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/update-api-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        setApiUrl(url); // Update the URL in the form
        alert(`API URL updated successfully to: ${url}`);
      } else {
        setError(`Failed to update API URL: ${data.message}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Ultra API Debug</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Connection Settings</CardTitle>
          <CardDescription>
            Configure the connection parameters for the Ultra API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="apiUrl">API URL:</label>
              <Input
                id="apiUrl"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://portal.it-ultra.com/b2b/ws/b2b.1cws"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="username">Username:</label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password">Password:</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="url-tests">
        <TabsList className="mb-4">
          <TabsTrigger value="url-tests">URL Tests</TabsTrigger>
          <TabsTrigger value="soap-tests">SOAP Tests</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="url-tests">
          <Card>
            <CardHeader>
              <CardTitle>URL Accessibility Tests</CardTitle>
              <CardDescription>
                Test if the API URL is accessible and returns the expected content type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Button
                  onClick={testUrl}
                  disabled={loading}
                  className="mb-4"
                >
                  {loading ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Test URL Accessibility
                </Button>

                <Button
                  onClick={testWebInterface}
                  disabled={loading}
                  variant="secondary"
                  className="mb-4"
                >
                  {loading ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Find API URL from Web Interface
                </Button>

                {urlTestResults && (
                  <Alert className="mt-4">
                    <CheckIcon className="h-4 w-4" />
                    <AlertTitle>Test Completed</AlertTitle>
                    <AlertDescription>
                      {urlTestResults}
                    </AlertDescription>
                  </Alert>
                )}

                {webInterfaceResults && (
                  <Alert className="mt-4">
                    <CheckIcon className="h-4 w-4" />
                    <AlertTitle>Web Interface Analysis</AlertTitle>
                    <AlertDescription>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium">Findings:</h4>
                        <ul className="list-disc pl-5 mt-1 text-sm">
                          {webInterfaceResults.findings.map((finding, index) => (
                            <li key={index}>{finding}</li>
                          ))}
                        </ul>

                        {webInterfaceResults.possibleApiUrls.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium">Possible API URLs:</h4>
                            <ul className="list-disc pl-5 mt-1 text-sm">
                              {webInterfaceResults.possibleApiUrls.map((url, index) => (
                                <li key={index} className="mb-2">
                                  {typeof url === 'string' ? (
                                    <>
                                      <div className="flex items-center">
                                        <span className="flex-1">{url}</span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => updateApiUrlSetting(url)}
                                          className="ml-2"
                                        >
                                          Use This URL
                                        </Button>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex items-center">
                                      <span className="flex-1">
                                        {url.url} - Status: {url.status},
                                        Type: {url.contentType || 'unknown'}
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateApiUrlSetting(url.url)}
                                        className="ml-2"
                                      >
                                        Use This URL
                                      </Button>
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="soap-tests">
          <Card>
            <CardHeader>
              <CardTitle>SOAP Request Tests</CardTitle>
              <CardDescription>
                Test SOAP requests using different methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Button
                  onClick={testSoapConnection}
                  disabled={loading}
                >
                  {loading ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Test with SOAP Client
                </Button>

                <Button
                  onClick={testHttpRequest}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Test with Manual HTTP Request
                </Button>

                <Button
                  onClick={test1CAuth}
                  disabled={loading}
                  variant="secondary"
                >
                  {loading ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Test 1C-Specific Authentication
                </Button>

                {testResults && (
                  <Alert className="mt-4">
                    <CheckIcon className="h-4 w-4" />
                    <AlertTitle>SOAP Test Results</AlertTitle>
                    <AlertDescription>
                      {testResults.success ? (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium">Details:</h4>
                          <ul className="list-disc pl-5 mt-1 text-sm">
                            {testResults.details.map((detail, index) => (
                              <li key={index}>{detail.step}: {detail.message}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium">Error:</h4>
                          <p>{testResults.error}</p>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {result && (
                  <Alert className="mt-4">
                    <CheckIcon className="h-4 w-4" />
                    <AlertTitle>HTTP Test Results</AlertTitle>
                    <AlertDescription>
                      <pre className="mt-2 whitespace-pre-wrap text-sm">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </AlertDescription>
                  </Alert>
                )}

                {oneCAuthResults && (
                  <Alert className="mt-4">
                    <CheckIcon className="h-4 w-4" />
                    <AlertTitle>1C Authentication Test Results</AlertTitle>
                    <AlertDescription>
                      <pre className="mt-2 whitespace-pre-wrap text-sm">
                        {JSON.stringify(oneCAuthResults, null, 2)}
                      </pre>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Key information from the Ultra API documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="functions">
                  <AccordionTrigger>Available Functions</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>requestData</strong> – General function to request data</li>
                      <li><strong>isReady</strong> – Checks if requested data is ready for transfer</li>
                      <li><strong>getDataByID</strong> – Function to obtain previously requested data</li>
                      <li><strong>CommitReceivingData</strong> – Function to confirm data receipt</li>
                      <li><strong>testService</strong> – Function to control connection to the service</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="request-data">
                  <AccordionTrigger>requestData Format</AccordionTrigger>
                  <AccordionContent>
                    <pre className="bg-slate-100 p-4 rounded-md text-sm">
{`<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ult="http://ultra.b2b.md">
  <soap:Header/>
  <soap:Body>
    <ult:requestData>
      <ult:Service>NOMENCLATURE</ult:Service>
      <ult:all>true</ult:all>
      <ult:additionalParameters></ult:additionalParameters>
      <ult:compress>false</ult:compress>
    </ult:requestData>
  </soap:Body>
</soap:Envelope>`}
                    </pre>
                    <p className="mt-2">
                      <strong>Service:</strong> Predefined table name (e.g., NOMENCLATURE)<br />
                      <strong>all:</strong> true = load all data, false = only new/changed<br />
                      <strong>additionalParameters:</strong> String with additional parameters<br />
                      <strong>compress:</strong> Whether to compress data (only for 1C-based systems)
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="is-ready">
                  <AccordionTrigger>isReady Format</AccordionTrigger>
                  <AccordionContent>
                    <pre className="bg-slate-100 p-4 rounded-md text-sm">
{`<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ult="http://ultra.b2b.md">
  <soap:Header/>
  <soap:Body>
    <ult:isReady>
      <ult:ID>[operation-id]</ult:ID>
    </ult:isReady>
  </soap:Body>
</soap:Envelope>`}
                    </pre>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="get-data">
                  <AccordionTrigger>getDataByID Format</AccordionTrigger>
                  <AccordionContent>
                    <pre className="bg-slate-100 p-4 rounded-md text-sm">
{`<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ult="http://ultra.b2b.md">
  <soap:Header/>
  <soap:Body>
    <ult:getDataByID>
      <ult:ID>[operation-id]</ult:ID>
    </ult:getDataByID>
  </soap:Body>
</soap:Envelope>`}
                    </pre>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="commit">
                  <AccordionTrigger>CommitReceivingData Format</AccordionTrigger>
                  <AccordionContent>
                    <pre className="bg-slate-100 p-4 rounded-md text-sm">
{`<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ult="http://ultra.b2b.md">
  <soap:Header/>
  <soap:Body>
    <ult:CommitReceivingData>
      <ult:Service>NOMENCLATURE</ult:Service>
    </ult:CommitReceivingData>
  </soap:Body>
</soap:Envelope>`}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <Cross2Icon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
