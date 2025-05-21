<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <title>404 • Page Not Found</title>
    <style>
        body {
            background: #fafafa;
            color: #333;
            font-family: 'Segoe UI';
            text-align: center;
            margin: 0;
            padding: 0;
        }
        .container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 100vh;
            padding: 20px;
        }
        h1 {
            font-size: 10rem;
            margin: 0;
            color: #e74c3c;
        }
        p {
            font-size: 1.5rem;
            margin: 10px 0 30px;
        }
        a {
            display: inline-block;
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
        <h1>404</h1>
        <p>We can’t find the page you’re looking for.</p>
        <a href="https://${server_name}">Go Back Home</a>
    </div>
    <div class="footer">
        &copy; 2025 MongoDB Airbnb Workshop
    </div>
</body>
</html>