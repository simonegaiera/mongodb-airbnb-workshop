<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width">
  <title>GameDay at ${customer_name}!</title>
  <link rel="icon" href="https://${server_name}/favicon.ico" type="image/x-icon">
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
            justify-content: flex-start;
            height: auto;
            width: 90%;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            font-size: 10rem;
            margin: 0;
            color: #00684A;
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
    <h1>GameDay at ${customer_name}!</h1>

    %{ if length(user_ids) > 0 }
      <div class="links">
        %{ for uid in user_ids }
          <p>
            <a href="https://${uid}.${record_name}/?folder=/home/workspace/mongodb-airbnb-workshop">
              ${uid}
            </a>
          </p>
        %{ endfor }
      </div>
    %{ else }
      <p><em>No users found.</em></p>
    %{ endif }

  </div>
  <div class="footer">
    &copy; 2025 MongoDB Airbnb Workshop
  </div>
</body>
</html>