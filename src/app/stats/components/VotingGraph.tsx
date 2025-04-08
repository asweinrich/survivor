"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";

const VotingGraph = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [contestants, setContestants] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [graph, setGraph] = useState<any>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const labelRendererRef = useRef<CSS2DRenderer>();
  const controlsRef = useRef<OrbitControls>();

  // Fetch data once on mount
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
      } catch (error) {
        console.error("Error fetching graph data:", error);
      }
    }

    fetchData();
  }, []);

  // Initialize Three.js scene
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

    // Lighting
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

  // Load graph after data is ready
  useEffect(() => {
    if (!contestants.length || !votes.length || graph || !sceneRef.current) return;

    (async () => {
      const ThreeForceGraph = (await import("three-forcegraph")).default;

      const links = votes
        .filter((vote: any) => vote.target !== null)
        .map((vote: any) => ({
          source: vote.voter,
          target: vote.target
        }));

      const graphData = { nodes: contestants, links };
      const myGraph = new ThreeForceGraph().graphData(graphData);

      // Custom 3D link objects using cylinders
      myGraph
        .linkThreeObject(() => {
          const geometry = new THREE.CylinderGeometry(0.7, 0.7, 1, 6);
          const material = new THREE.MeshStandardMaterial({ color: 0x77c471 });
          const mesh = new THREE.Mesh(geometry, material);

          // ✅ Tell ForceGraph what this object is
          mesh.userData.__threeObjType = 'link';

          return mesh;
        })
        .linkPositionUpdate((link, { start, end }, obj) => {
          if (!(obj instanceof THREE.Object3D)) return;

          const startVec = new THREE.Vector3(start.x, start.y, start.z);
          const endVec = new THREE.Vector3(end.x, end.y, end.z);
          const distance = startVec.distanceTo(endVec);

          obj.scale.set(1, distance, 1);

          const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
          obj.position.copy(midPoint);

          obj.lookAt(endVec);
        });


      // Custom DOM node rendering using CSS2DObject
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
      setGraph(myGraph);
    })();
  }, [contestants, votes, graph]);

  // Animate scene
  useEffect(() => {
    if (
      !graph ||
      !rendererRef.current ||
      !cameraRef.current ||
      !sceneRef.current ||
      !controlsRef.current ||
      !labelRendererRef.current
    )
      return;

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      graph.tickFrame();
      controlsRef.current.update();
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      labelRendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animate();
    return () => cancelAnimationFrame(reqId);
  }, [graph]);

  return (
    <div className="relative w-full h-[500px] rounded-lg">
      <div ref={canvasContainerRef} className="absolute w-full h-full top-0 left-0" />
    </div>
  );
};

export default VotingGraph;
