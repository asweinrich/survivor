"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";

const VotingGraph = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [contestants, setContestants] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const graphRef = useRef<any>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const labelRendererRef = useRef<CSS2DRenderer>();
  const controlsRef = useRef<OrbitControls>();

  const [currentCouncil, setCurrentCouncil] = useState<number>(1);

  const maxCouncil = useMemo(() => {
    const councils = votes.map((v) => v.council).filter((v) => typeof v === 'number');
    return councils.length > 0 ? Math.max(...councils) : 1;
  }, [votes]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [contestantsRes, votesRes] = await Promise.all([
          fetch("/api/contestants"),
          fetch("/api/votes"),
        ]);

        if (!contestantsRes.ok || !votesRes.ok) {
          throw new Error("API request failed.");
        }

        const contestantsData = await contestantsRes.json();
        const votesData = await votesRes.json();

        setContestants(contestantsData.map((c: any) => ({
          id: c.id,
          img: c.img
        })));

        setVotes(votesData);

        const validCouncils = votesData.map((v: any) => v.council).filter((v: any) => typeof v === 'number');
        if (validCouncils.length > 0) {
          setCurrentCouncil(Math.max(...validCouncils));
        }
      } catch (error) {
        console.error("Error fetching graph data:", error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (!canvasContainerRef.current || rendererRef.current) return;

    const container = canvasContainerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 150);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0";
    labelRenderer.domElement.style.left = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    container.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.minDistance = 50;
    controls.maxDistance = 500;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(50, 50, 100);
    scene.add(ambientLight, directionalLight);

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      labelRenderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);
      container.removeChild(labelRenderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (!contestants.length || !votes.length || graphRef.current || !sceneRef.current) return;

    (async () => {
      const ThreeForceGraph = (await import("three-forcegraph")).default;

      const filteredLinks = votes
        .filter((v: any) => v.council <= currentCouncil && v.target !== null)
        .map((v: any) => ({
          source: v.voter,
          target: v.target,
          tribalCouncil: v.council
        }));

      const graphData = {
        nodes: contestants,
        links: filteredLinks
      };

      const myGraph = new ThreeForceGraph().graphData(graphData);

      myGraph
        .linkColor((link: any) => {
          const diff = currentCouncil - link.tribalCouncil;
          return diff >= 0 ? `rgba(255,0,0,${Math.max(0.2, 1 - diff * 0.2)})` : 'rgba(0,0,0,0)';
        })
        .linkOpacity((link: any) => {
          const diff = currentCouncil - link.tribalCouncil;
          return diff >= 0 ? Math.max(0.2, 1 - diff * 0.2) : 0;
        });

      myGraph.nodeThreeObject(({ img }: { img: string }) => {
        if (!img) return null;

        const wrapper = document.createElement("div");
        wrapper.style.padding = "4px";
        wrapper.style.border = "2px solid #57534e";
        wrapper.style.borderRadius = "9999px";
        wrapper.style.backgroundColor = "#000000";
        wrapper.style.width = "50px";
        wrapper.style.height = "50px";
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.style.justifyContent = "center";
        wrapper.style.boxSizing = "border-box";

        const imgEl = document.createElement("img");
        imgEl.src = `/imgs/${img}.png`;
        imgEl.style.width = "100%";
        imgEl.style.height = "100%";
        imgEl.style.borderRadius = "9999px";
        imgEl.style.objectFit = "cover";

        wrapper.appendChild(imgEl);
        return new CSS2DObject(wrapper);
      });

      sceneRef.current.add(myGraph);
      graphRef.current = myGraph;
    })();
  }, [currentCouncil, contestants, votes]);

  useEffect(() => {
    if (!graphRef.current || !votes.length) return;

    const filteredLinks = votes
      .filter((v: any) => v.council <= currentCouncil && v.target !== null)
      .map((v: any) => ({
        source: v.voter,
        target: v.target,
        tribalCouncil: v.council
      }));

    graphRef.current.graphData({
      nodes: contestants,
      links: filteredLinks
    });

    graphRef.current
      .linkColor((link: any) => {
        const diff = currentCouncil - link.tribalCouncil;
        return diff >= 0 ? `rgba(255,0,0,${Math.max(0.2, 1 - diff * 0.2)})` : 'rgba(0,0,0,0)';
      })
      .linkOpacity((link: any) => {
        const diff = currentCouncil - link.tribalCouncil;
        return diff >= 0 ? Math.max(0.2, 1 - diff * 0.2) : 0;
      });
  }, [currentCouncil, votes, contestants]);

  useEffect(() => {
    if (
      !graphRef.current ||
      !rendererRef.current ||
      !cameraRef.current ||
      !sceneRef.current ||
      !controlsRef.current ||
      !labelRendererRef.current
    ) return;

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      graphRef.current.tickFrame();
      controlsRef.current.update();
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      labelRendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animate();
    return () => cancelAnimationFrame(reqId);
  }, []);

  return (
    <div className="relative">
      {votes.length > 0 && !isNaN(currentCouncil) && !isNaN(maxCouncil) && (
        <div className="absolute top-2 left-2 z-10 bg-white/80 p-2 rounded shadow">
          <label className="text-sm font-medium">Tribal Council: {currentCouncil}</label>
          <input
            type="range"
            min={1}
            max={maxCouncil.toString()}
            value={currentCouncil.toString()}
            onChange={(e) => setCurrentCouncil(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}
      <div className="relative w-full h-[500px] rounded-lg">
        <div ref={canvasContainerRef} className="absolute w-full h-full top-0 left-0" />
      </div>
    </div>
  );
};

export default VotingGraph;
