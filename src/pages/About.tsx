function About() {
  return (
    <div>
      <h1>About Crypto Dashboard</h1>
      <p style={{ color: "gray" }}>
        Learn more about Crypto Dashboard and our mission.
      </p>

      <section style={{ marginTop: "2rem" }}>
        <h2>What is Crypto Dashboard?</h2>
        <p>
          Crypto Dashboard is a cryptocurrency market dashboard built to
          showcase modern web development skills. It demonstrates how to build
          an interactive application using React, TypeScript, and Vite.
        </p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>What It Shows</h2>
        <ul>
          <li>
            <strong>Live Market Data:</strong> Real-time cryptocurrency prices
            and market statistics
          </li>
          <li>
            <strong>Candlestick Charts:</strong> Visual representation of price
            movements over time
          </li>
          <li>
            <strong>Market Table:</strong> Organized view of different
            cryptocurrencies with key metrics
          </li>
          <li>
            <strong>Market Controls:</strong> Filter and sort options to explore
            data interactively
          </li>
        </ul>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>How It Works</h2>
        <p>
          The app fetches cryptocurrency market data from a backend API and
          displays it through an intuitive interface. You can view different
          cryptocurrencies, analyze their price charts, and explore market
          trends. The dashboard is fully responsive and built with modern React
          components.
        </p>
      </section>
    </div>
  );
}

export default About;
