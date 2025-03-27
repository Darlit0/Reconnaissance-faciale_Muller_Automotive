import { useState } from 'react';
import Header from '/src/components/Header';
import Aside from '/src/components/Asideaa';
import { Outlet } from "react-router-dom";
import '/src/App.css';

function Main() {
  return (
    <>
        <div style={{ display: "flex" }}>
            <Aside />
            <div style={{ flex: 1 }}>
                <Header />
                <main style={{ padding: "20px" }}>
                <Outlet />
                </main>
            </div>
        </div>
    </>
  )
}

export default Main