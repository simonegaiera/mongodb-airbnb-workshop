<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width">
  <titleMongoDB AI Arena</title>
  <link rel="icon" href="https://${server_name}/favicon.ico" type="image/x-icon">
  <style>
        body {
            background: #fafafa;
            color: #3d4144;
            font-family: 'BlinkMacSystemFont';
            text-align: center;
            margin: 0;
            padding: 0;
        }
        .container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 100vh;
            width: 90%;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
          font-size: 6em;
          font-weight: bold;
          margin: 0;
          color: #3d4144;
          margin-bottom: 2rem;
        }
        p {
            font-size: 1.5em;
            margin: 10px 0 30px;
        }
        a {
            display: block;
            width: 500px;
            margin: 0 auto;
            text-align: center;
            padding: 12px 24px;
            background: #00684A;
            color: #fff;
            text-decoration: none;
            border-radius: 4px;
            transition: background 0.2s ease;
        }
        a:hover {
            background: #00684A;
        }
        .footer {
            position: absolute;
            bottom: 10px;
            width: 100%;
            font-size: 0.9rem;
            color: #aaa;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>50x</h1>
        <p>Oops! Either the URL is mistyped or your workspace isn’t provisioned yet.</p>
        <p>Click below to check if your account exists and get set up:</p>
        <a href="https://${server_name}">Validate Your Account</a>
    </div>
    <div class="footer">
        &copy; 2025 MongoDB Airbnb Workshop
    </div>
</body>
</html>