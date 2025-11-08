'use client';

import { useState } from 'react';
import { Mail, Calendar, CheckCircle, XCircle, Loader2, FileText } from 'lucide-react';

export default function TestActionsPage() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<string>('');

  const testEmail = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/test/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'anantsinghal2134@gmail.com',
          subject: 'Test Email from Meeting App',
        }),
      });

      const data = await response.json();
      setResults(prev => [...prev, {
        type: 'email',
        success: data.success,
        message: data.success ? 'Email sent successfully!' : data.error,
        timestamp: new Date().toISOString(),
      }]);

      // Fetch email logs
      await fetchEmailLogs();
    } catch (error) {
      setResults(prev => [...prev, {
        type: 'email',
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setTesting(false);
    }
  };

  const testMeeting = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/test/meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Follow-up Meeting',
          participants: ['anantsinghal2134@gmail.com'],
        }),
      });

      const data = await response.json();
      setResults(prev => [...prev, {
        type: 'meeting',
        success: data.success,
        message: data.success ? `Meeting created: ${data.meetingId}` : data.error,
        timestamp: new Date().toISOString(),
      }]);
    } catch (error) {
      setResults(prev => [...prev, {
        type: 'meeting',
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setTesting(false);
    }
  };

  const testTask = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/test/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'Test task from automation system',
          assignee: 'anantsinghal2134@gmail.com',
          priority: 'high',
        }),
      });

      const data = await response.json();
      setResults(prev => [...prev, {
        type: 'task',
        success: data.success,
        message: data.success ? `Task created: ${data.taskId}` : data.error,
        timestamp: new Date().toISOString(),
      }]);
    } catch (error) {
      setResults(prev => [...prev, {
        type: 'task',
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setTesting(false);
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const response = await fetch('/api/test/email-logs');
      const data = await response.json();
      if (data.success) {
        setEmailLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching email logs:', error);
    }
  };

  const testAll = async () => {
    setResults([]);
    await testEmail();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testMeeting();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testTask();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Test Automated Actions</h1>
          <p className="text-gray-600 mb-8">
            Test your email, meeting scheduling, and task creation functionality
          </p>

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={testEmail}
              disabled={testing}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
              Test Email
            </button>

            <button
              onClick={testMeeting}
              disabled={testing}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
              Test Meeting Creation
            </button>

            <button
              onClick={testTask}
              disabled={testing}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
              Test Task Creation
            </button>

            <button
              onClick={testAll}
              disabled={testing}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              Test All
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Test Results</h2>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium capitalize">{result.type}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                          {result.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Logs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Email Logs (Development Mode)</h2>
              <button
                onClick={fetchEmailLogs}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Refresh Logs
              </button>
            </div>
            
            {emailLogs ? (
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
                <pre>{emailLogs}</pre>
              </div>
            ) : (
              <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-500">
                No email logs yet. Send a test email to see logs here.
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📝 How to Check Results:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Emails:</strong> Check the logs above (dev mode) or check logs/emails.log file</li>
              <li>• <strong>Meetings:</strong> Check Firestore 'meetings' collection</li>
              <li>• <strong>Tasks:</strong> Check Firestore 'action-items' collection</li>
              <li>• <strong>Production:</strong> Configure SMTP in .env.local to send real emails</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
