import React from 'react';
import { createRoot } from 'react-dom/client';
import { Stage, Layer, Image } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva'
import { Button } from '@mui/material';
import './App.css';

const URLImage = ({ image }) => {
  const [img] = useImage(image.src);
  return (
    <Image
    className="canvas-img"
      image={img}
      x={image.x}
      y={image.y}
      // I will use offset to set origin to the center of the image
      offsetX={img ? img.width / 2 : 0}
      offsetY={img ? img.height / 2 : 0}
      
    />
  );
};


const Video = (props) => {
  const imageRef = React.useRef(null);
  const [size, setSize] = React.useState({ width: 50, height: 50 });
  console.log('state ==>', props)
  const [canvas, setCanvas] = React.useState(null);
  // we need to use "useMemo" here, so we don't create new video elment on any render
  const videoElement = React.useMemo(() => {
    const element = document.createElement("video");
    element.src = props.src;
    return element;
  }, [props.src]);
 React.useEffect(() => {

 }, [canvas])
  // when video is loaded, we should read it size
  React.useEffect(() => {
    const onload = function() {
      setSize({
        width: videoElement.videoWidth,
        height: videoElement.videoHeight
      });
    };
    videoElement.currentTime = 2;
    const canvasset = function() {
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      // videoElement.currentTime = 1;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoElement, 0, 0);
      console.log(canvas);
      setCanvas(canvas);
    };
    videoElement.addEventListener("loadedmetadata", onload);
    videoElement.addEventListener("canplay", canvasset);
    return () => {
      videoElement.removeEventListener("load", onload);
      videoElement.removeEventListener("load", canvasset);
    };
  }, [videoElement]);
  React.useEffect(() => {
    if(props.imgS){
    const layer = imageRef.current.getLayer();
      Konva.Image.fromURL(props.imgS, function(image) {
        // make it draggable
        image.setAttrs({
            draggable: true
        });
        // append to layer
        layer.add(image);
        // update layer
        layer.draw();
    })
  }
  }, [props.imgS])
  let txtNode = '';
  React.useEffect(() => {
    if(props.txt){
    const layer = imageRef.current.getLayer();
    txtNode = new Konva.Text({
      text:'Sample Text',
      fontSize: 25,
      fontFamily: 'Calibri',
      fill: '#000',
      width: 250,
      padding: 25,
      align: 'center',
      draggable: true
  })
  layer.add(txtNode);
  layer.draw();
  txtNode.on('dblclick dbltap', () => {
    // create textarea over canvas with absolute position

    // first we need to find position for textarea
    // how to find it?

    // at first lets find position of text node relative to the stage:
    var textPosition = txtNode.getAbsolutePosition();

    // then lets find position of stage container on the page:
    // var stageBox = stage.container().getBoundingClientRect();

    // // so position of textarea will be the sum of positions above:
    // var areaPosition = {
    //   x: stageBox.left + textPosition.x,
    //   y: stageBox.top + textPosition.y,
    // };

    // create textarea and style it
    var textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = txtNode.text();
    textarea.style.position = 'absolute';
    textarea.style.top = '30' + 'px';
    textarea.style.left = '900'+ 'px';
    textarea.style.width = txtNode.width();

    textarea.focus();

    textarea.addEventListener('keydown', function (e) {
      // hide on enter
      if (e.keyCode === 13) {
        txtNode.text(textarea.value);
        document.body.removeChild(textarea);
      }
    });
  });
  }
  }, [props.txt])

  React.useEffect(() => {
    if (props.state == 'pause'){
      videoElement.pause()
      const layer = imageRef.current.getLayer();
  
      const anim = new Konva.Animation(() => {}, layer);
      anim.stop()
    }
  }, [props.state])
  React.useEffect(() => {
    if (props.state == 'play' && videoElement && props.src){
      console.log('videlement',videoElement)
      videoElement.play();
      const layer = imageRef.current.getLayer();
      const anim = new Konva.Animation(() => {}, layer);
      anim.start();
  
      return () => anim.stop();
    } else if (props.state == 'pause'){
      videoElement.pause()
      const layer = imageRef.current.getLayer();
  
      const anim = new Konva.Animation(() => {}, layer);
      anim.stop()
    } else if (props.state === 'stop') {
      videoElement.pause();
    }
  }, [videoElement, props.state, props.src]);

  return (
    <Image
      ref={imageRef}
      image={props.state === 'play' || props.state === 'pause' ? videoElement : canvas}
      x={20}
      y={20}
      width="1000"
      height="600"
      fill="#f0f0f0"
      draggable
    />
  );
};

const App = () => {
  const dragUrl = React.useRef();
  const stageRef = React.useRef();
  const [state, setState] = React.useState('');
  const imageRef = React.useRef(null);
  const [size, setSize] = React.useState({ width: 50, height: 50 });
  const hiddenFileInput = React.useRef(null);
  const [videoSrc0 , seVideoSrc0] = React.useState("");
  const [videoSrc1 , seVideoSrc1] = React.useState("");
  const [videoSrc2 , seVideoSrc2] = React.useState("");
  const [vidUrl, setVidUrl] = React.useState(null);
  const [count, setCount] = React.useState(0);
  const [imgS, setImg] = React.useState('');
  const [txt, setTxt] = React.useState('');
  // Programatically click the hidden file input element
  // when the Button component is clicked
  const handleClick = event => {
    hiddenFileInput.current.click();
  };
  // Call a function (passed as a prop from the parent component)
  async function getThumbnailForVideo(videoUrl) {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    video.style.display = "none";
    canvas.style.display = "none";
  
    // Trigger video load
    await new Promise((resolve, reject) => {
      video.addEventListener("loadedmetadata", () => {
        video.width = 300;
        video.height = 200;
        canvas.width = 300;
        canvas.height =200;
        // Seek the video to 25%
        video.currentTime = video.duration * 0.25;
      });
      video.addEventListener("seeked", () => resolve());
      video.src = videoUrl;
      if(count === 0) {
        seVideoSrc0(videoUrl);
      } else if(count === 1) {
        seVideoSrc1(videoUrl);
      } else if(count === 2) {
        seVideoSrc2(videoUrl);
      }
    });
  
    // Draw the thumbnailz
    canvas
      .getContext("2d")
      .drawImage(video, 0, 0, 300, 200);
    const imageUrl = canvas.toDataURL("image/png");
    return imageUrl;
  }
  const handleChange = async event => {
    console.log('hidden ==>',hiddenFileInput.current.files[0]);
    let cnt = count;
    const img = document.getElementById(`img-thumb${count}`);
    var reader = new FileReader();
    console.log(event.target.files[0])
    var url = URL.createObjectURL(hiddenFileInput.current.files[0]);
    const thumbUrl = await getThumbnailForVideo(url);
    img.src = thumbUrl;
    cnt ++;
    setCount(cnt);
  };

  React.useEffect(() => {

  }, [state])
  React.useEffect(() => {

  }, [count])
  React.useEffect(() => {

  }, [imgS])
  React.useEffect(() => {

  }, [txt])
  const play = () => {
    setState('play')
  }
  const pause = () => {
    setState('pause')
  }
  const playVid0 = () => {
    setState('stop')
    setVidUrl(videoSrc0);
  }
  const playVid1 = () => {
    setState('stop')
    setVidUrl(videoSrc1);
  }
  const playVid2 = () => {
    setState('stop')
    setVidUrl(videoSrc2);
  }
  const addImage = () => {
    setImg('https://konvajs.org/assets/lion.png')
  }
  const addTxt = () => {
    setTxt('txt')
  }
  return (
    <div >
      <br />

      <Button className="btn-style" variant="contained" onClick={handleClick}>Add File</Button>

      <input type="file"
             ref={hiddenFileInput}
             onChange={handleChange}
             style={{display:'none'}} 
      /> 
 <Button className="btn-style" variant="contained" value={state} onClick={play}>Play</Button>
 <Button className="btn-style" variant="contained" value={state} onClick={pause}>Pause</Button>
 <Button className="btn-style" variant="contained" value={state} onClick={addImage}>Add Image</Button>
 <Button className="btn-style" variant="contained" value={state} onClick={addTxt}>Add Text</Button>
      <div className="canvas">
      <Stage width="1000" height="600" align="center">
        <Layer>
          <Video txt={txt} imgS={imgS} state={state} src={vidUrl} />
        </Layer>
      </Stage>
      </div>
     <div className="thumbnail-group">
     <img id="img-thumb0" className="w-100" alt="" onClick={playVid0}/>
      <img id="img-thumb1" className="w-100" alt="" onClick={playVid1}/>
      <img id="img-thumb2" className="w-100" alt="" onClick={playVid2}/>
     </div>
    </div>
  );
};

export default App;
