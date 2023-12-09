// eslint-disable 
import React, { useCallback, useContext, useEffect, useMemo } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "./Main";
import DATARAW from '../assets/bc1qfqqed76qxqm2epmxlv7ywgjz8k6tk472pj7msn.json';
import KqrData from '../assets/1KqrDhH3jV98vRqXL2F8BGjGbRZqWMJ5c9.json'
import mHBData from '../assets/13mHBgLwVBrZtpQ1JAndCkic4FBMPiuocB.json'
import bs9Data from '../assets/178bs9PcpiQbvk6t1vJRNBr85pofYYHiL7.json'
import ReactFlow, {MarkerType, useNodesState, useEdgesState, addEdge, Edge, Node, Controls, MiniMap, Background, Connection, Handle, Position, Panel, useReactFlow, getRectOfNodes, getTransformForBounds, useNodeId } from 'reactflow';

import 'reactflow/dist/style.css';
import { toPng } from "html-to-image";
import toast, { ToastBar, Toaster } from "react-hot-toast";
import { ContextMenu } from "@radix-ui/themes";
import { ActionType, ContainerProvider } from "../ContextProvider";
import CustomNodder from "../components/FLowGen/CustomNode";
import { SERVER_IP } from "../utils/ServerConst";
// const initialNodes = [
//     { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
//     { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
// ];
// const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
export default function GraphExplorer() {
    // Context Data Gets the Data of All Available Node
    const { addr } = useParams();
    const ContextData  = useContext(ContainerProvider)

// Elements Gets Data from All Element
    const Elements = Array(5).fill(0).map((_, i) => ({
        id: `${i + 1}`,
        data: { label: `Node ${i + 1}` },
        position: {
            x: Math.random() * window.innerWidth - 100,
            y: Math.random() * window.innerHeight,
        },
    }));
    let CenterNodeX = 350;
    let CenterNodeY = 150;
    const [data, setData] = useState<any>(null)

    React.useEffect(() => {
        fetch(`${SERVER_IP}/address?parameters=${addr}`).then((res)=>res.json()).then((data)=>{
            // console.log(data)
            setData(data)
            setLoading(false)
        })

        // setTimeout(() => {
        //     setLoading(false)
            // setData(DATARAW)
        // }, 2700)
    }, [])
    // console.log(data.address)

    // const initialNodes: Node[] = 
    const initialNodes: Node[] = ([]
    );
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

    // const initialEdges: Edge[] = [...Elements.map((_, index) => {
    //     return { id: `e${index + 1}-source`, source: `${index + 1}`, target: 'source', animated: true }
    // })]

    const initialEdges: Edge[] = []


    // );

    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        // const NewData = data.txs.map((tx:any,index:number)=>{
        //     return {
        //         id: `${index+1}`,
        //         data: { label: `Node ${index+1}` },
        //     }})
        //     console.log(NewData)
        if (data == null) return
// DOC: Mapper Data Maps Data to a Custom Data Format for Visualizer
    let MapperData = data.map((Tx,index)=>{
        return {
                            type: "selectorNode",
                id: Tx.id as string,
                data: { label: `${Tx.id}`,isDestiny:true ,IncomingTx:Tx.IncomingTx},
                position: {
                    x: Math.cos(2 * Math.PI * index / data.length) * 170 + CenterNodeX,
                    y: Math.sin(2 * Math.PI * index / data.length) * 170 + CenterNodeY,
                }
        }
    })
    // console.log(MapperData)
        setNodes([...MapperData, { id: 'source', position: { x: CenterNodeX, y: CenterNodeY }, type: "selectorNode", data: { label: addr, isSource: true } }])
        setEdges([...MapperData.map((DataID,index:number)=>{
          
            if (DataID.data.IncomingTx==true){
                
                return {
                    id: `esource-${DataID.id}-${index}`, source:  'source' as unknown as string, target:  DataID.id as unknown as string , animated:true,markerStart: {
                        type: MarkerType.Arrow,
                      },
                }
            }else{
                return { id: `e${DataID.id}-source-${index}`, source: DataID.id as unknown as string, target: 'source' , animated:true ,markerStart: {
                    type: MarkerType.Arrow,
                  },
            }
            }
        })])
        
        // setEdges([...MapperData.map((NewDataID, index) => {
        //     return { id: `e${NewDataID.id}-source`, source: NewDataID.id as unknown as string, target: 'source', animated: true }
        // })])

    }, [data])


    // useEffect(()=>{
    //     // console.log(ContextData?.state)
    //     setNodes((node)=>node.filter((item)=>!ContextData?.state.deletedNode.includes(item.id)))
    //     setEdges((edge)=>edge.filter((item)=>{
    //         return !ContextData?.state.detachedNode.includes(item.source as string) && !ContextData?.state.deletedNode.includes(item.target as string)
    //     }))

    // },[ContextData?.state.deletedNode,ContextData?.state.detachedNode])

    // useEffect(()=>{

    //     if (ContextData?.state.extenderNode.nodeId == "") return
        
    //     const toastId = toast.loading('Loading...');


    //     setTimeout(() => {
    //         // console.log(ContextData?.state.extenderNode.nodeId)

    //         toast.success('Graph Data Fetched');
    //         setTimeout(()=>{
    //             toast.dismiss()
    //         },700)



    //     },1000)



    //     return ()=>{
    //         toast.dismiss(toastId)
    //     }

    // },[ContextData?.state.extenderNode])


    const nodeTypes = useMemo(() => ({ selectorNode: CustomNodder }), []);

    const onConnect = useCallback((params:Edge | Connection) => setEdges((eds) => addEdge( {
        id: `e${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        animated: true
    } as any   , eds)), [setEdges]);

    // const { addr } = useParams<{ addr: string }>()
    const [loading, setLoading] = useState(true)

    if (loading)
        return (
            <>
                <div className="flex justify-center items-center h-screen bg-[#181716] text-white text-lg">
                    Loading Data from Server Please Be Patient
                </div>
            </>
        );


    // console.log(data)

    return<><Toaster/> <div className="h-screen flex flex-col">
        <Header />
        <div className="w-full grow flex justify-center items-center ">

            <ReactFlow
            style={{
                backgroundColor: "#181716"
            }}
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView={true}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            >
                 <Background color="#323332" variant="dots" />

                {/* <Panel position="top-right">top-left</Panel> */}
                <DownloadButton />
            </ReactFlow>
            <Controls />
            <MiniMap style={{
                backgroundColor:"#323332"
            }} 
            nodeBorderRadius={100}

            // nodeComponent={()=>{
            //     return <div className="rounded-full h-10 w-10">
            //         ass
            //     </div>
            // }}
            pannable zoomable
            
            />
            {/* <Background variant="dots" gap={12} size={1} /> */}

        </div></div>
        </>


}




function downloadImage(dataUrl: string) {
    const a = document.createElement('a');

    a.setAttribute('download', 'tracer-graph.png');
    a.setAttribute('href', dataUrl);
    a.click();
}

const imageWidth = 1024;
const imageHeight = 768;

function DownloadButton() {
    const { getNodes } = useReactFlow();
    const onClick = () => {
        // we calculate a transform for the nodes so that all nodes are visible
        // we then overwrite the transform of the `.react-flow__viewport` element
        // with the style option of the html-to-image library
        const nodesBounds = getRectOfNodes(getNodes());
        const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

        toPng(document.querySelector('.react-flow__viewport') as HTMLElement, {
            backgroundColor: "#181716",
            width: imageWidth,
            height: imageHeight,
            style: {
                width: imageWidth.toString(),
                height: imageHeight.toString(),
                transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
            },
        }).then(downloadImage);
    };

    return (
        <Panel position="top-right">
            <button className="font-semibold border-2 bg-black text-white  p-2 rounded-md hover:bg-gray-800 transition-all hover:transition-all" onClick={onClick}>
                Save Graph Locally
            </button>
        </Panel>
    );
}


  