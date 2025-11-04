export default async function handler(req, res) {
  const response = await fetch('https://ab.reasonlabsapi.com/sub/sdk-QtSYWOMLlkHBbNMB', {
    method: 'GET', // or 'POST' if needed
    headers: {
      'Content-Type': 'application/json',
      // Add any headers required by ReasonLabs API
    },
  });

  const data = await response.json();
  res.status(200).json(data);
}