import React from 'react';

import { Button } from "@/ui/components/ui/button";

function App(): JSX.Element {
  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', paddingTop: '50px' }}>
      <h1>Project Wiz - Refactored Frontend</h1>
      <p>UI Application Placeholder - It works!</p>
      <div style={{ marginTop: '20px' }}>
        <Button>Click Me</Button>
        <Button variant="secondary" style={{ marginLeft: '10px' }}>Secondary Button</Button>
      </div>
    </div>
  );
}

export default App;
