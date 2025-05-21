<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width">
  <title>MongoDB AirBnb GameDay</title>
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
            justify-content: flex-start;
            height: auto;
            width: 90%;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0;
          color: #3d4144;
          margin-bottom: 2rem;
        }
        .customer-name {
            color: #00684A;
        }
        p {
            font-size: 1.5em;
            margin: 10px 0 30px;
        }
        a {
            display: inline-block;
            padding: 12px 24px;
            color: #3d4144;
            text-decoration: none;
            border-radius: 4px;
            transition: background 0.2s ease;
        }
        a:hover {
            background: #00684A;
            color: #fff;
        }
        .links {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 20px;
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
    <h1>
      GameDay at 
      <span class="customer-name">${customer_name}!</span>
    </h1>
    
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