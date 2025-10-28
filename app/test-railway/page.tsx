'use client';

import { useState } from 'react';
import { railwayApi } from '@/lib/railway-api';

export default function TestRailwayPage() {
  const [status, setStatus] = useState<string>('Not tested');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const addResult = (test: string, success: boolean, message: string, data?: any) => {
    setTestResults(prev => [...prev, { test, success, message, data, timestamp: new Date().toISOString() }]);
  };

  const testHealthCheck = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      addResult('Health Check', true, 'Testing Railway backend health...', null);

      const isHealthy = await railwayApi.healthCheck();

      if (isHealthy) {
        addResult('Health Check', true, '✅ Railway backend is healthy and reachable!');
        setStatus('✅ Connected to Railway backend!');
      } else {
        addResult('Health Check', false, '❌ Backend responded but health check failed');
        setStatus('⚠️ Backend unhealthy');
      }
    } catch (error: any) {
      addResult('Health Check', false, `❌ Error: ${error.message}`, error);
      setStatus(`❌ Connection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetProperties = async () => {
    setLoading(true);

    try {
      addResult('Get Properties', true, 'Fetching properties from Railway backend...');

      const response = await railwayApi.getProperties({ page: 1, pageSize: 10 });

      addResult('Get Properties', true, `✅ Successfully fetched properties!`, response);
    } catch (error: any) {
      addResult('Get Properties', false, `❌ Error: ${error.message}`, error);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);

    try {
      addResult('Authentication', true, 'Testing auth endpoint...');

      // Try to get current user (will fail if not authenticated, which is expected)
      try {
        const user = await railwayApi.getCurrentUser();
        addResult('Authentication', true, '✅ Authenticated! User data retrieved.', user);
      } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
          addResult('Authentication', true, '✅ Auth endpoint reachable (not logged in, which is expected)');
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      addResult('Authentication', false, `❌ Error: ${error.message}`, error);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);
    setStatus('Running all tests...');

    await testHealthCheck();
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    await testGetProperties();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testAuth();

    setStatus('All tests completed!');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Railway Backend Connection Test</h1>
          <p className="text-gray-600 mb-8">Test the connection between your Next.js frontend and Railway C# backend</p>

          {/* Configuration Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-900 mb-2">Current Configuration</h2>
            <div className="space-y-1 text-sm">
              <p className="text-blue-800">
                <span className="font-medium">Backend URL:</span>{' '}
                <code className="bg-blue-100 px-2 py-1 rounded">{process.env.NEXT_PUBLIC_API_URL || 'Not configured'}</code>
              </p>
              <p className="text-blue-800">
                <span className="font-medium">Socket URL:</span>{' '}
                <code className="bg-blue-100 px-2 py-1 rounded">{process.env.NEXT_PUBLIC_SOCKET_IO_URL || process.env.SOCKET_IO_URL || 'Not configured'}</code>
              </p>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={testHealthCheck}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : '🏥 Health Check'}
            </button>

            <button
              onClick={testGetProperties}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : '🏠 Test Properties API'}
            </button>

            <button
              onClick={testAuth}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : '🔐 Test Auth API'}
            </button>

            <button
              onClick={runAllTests}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : '🚀 Run All Tests'}
            </button>
          </div>

          {/* Status */}
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">Status</h2>
            <p className={`text-lg ${status.includes('✅') ? 'text-green-600' : status.includes('❌') ? 'text-red-600' : 'text-gray-600'}`}>
              {status}
            </p>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-4">Test Results</h2>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      result.success
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{result.test}</h3>
                      <span className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className={`text-sm mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                      {result.message}
                    </p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                          View Details
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 border-t pt-6">
            <h2 className="font-semibold text-gray-900 mb-3">How to Use</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Ensure your Railway backend is deployed and running</li>
              <li>Update <code className="bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_API_URL</code> in <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code></li>
              <li>Restart your Next.js dev server</li>
              <li>Click the test buttons above to verify the connection</li>
              <li>Check browser console (F12) for detailed logs</li>
            </ol>
          </div>

          {/* Help Section */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Troubleshooting</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
              <li>If tests fail, check that your Railway backend is running</li>
              <li>Verify the backend URL in your environment variables</li>
              <li>Check CORS settings on your Railway backend</li>
              <li>See <code className="bg-yellow-100 px-2 py-1 rounded">RAILWAY_SETUP.md</code> for detailed instructions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
