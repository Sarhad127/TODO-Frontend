//
// import React from 'react';
//
// function BackgroundSettingsModal({ onClose, onColorChange, onImageUpload }) {
//   const [selectedTab, setSelectedTab] = React.useState('color');
//   const [selectedColor, setSelectedColor] = React.useState('#ffffff');
//   const [uploadedImage, setUploadedImage] = React.useState(null);
//
//   const handleColorChange = (e) => {
//     setSelectedColor(e.target.value);
//   };
//
//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const imageUrl = URL.createObjectURL(file);
//       setUploadedImage(imageUrl);
//     }
//   };
//
//   const applyChanges = () => {
//     if (selectedTab === 'color') {
//       onColorChange(selectedColor);
//     } else if (selectedTab === 'image' && uploadedImage) {
//       onImageUpload(uploadedImage);
//     }
//     onClose();
//   };
//
//   return (
//     <div className="modal-overlay">
//       <div className="modal">
//         <h2>Customize Background</h2>
//         <div className="tabs">
//           <button
//             className={selectedTab === 'color' ? 'active' : ''}
//             onClick={() => setSelectedTab('color')}
//           >
//             Color
//           </button>
//           <button
//             className={selectedTab === 'image' ? 'active' : ''}
//             onClick={() => setSelectedTab('image')}
//           >
//             Image
//           </button>
//         </div>
//         {selectedTab === 'color' ? (
//           <div className="color-picker">
//             <input type="color" value={selectedColor} onChange={handleColorChange} />
//           </div>
//         ) : (
//           <div className="image-upload">
//             <input type="file" accept="image/*" onChange={handleImageUpload} />
//             {uploadedImage && (
//               <div className="image-preview">
//                 <img src={uploadedImage} alt="Uploaded Background" />
//               </div>
//             )}
//           </div>
//         )}
//         <div className="modal-buttons">
//           <button onClick={applyChanges}>Apply</button>
//           <button className="cancel-btn" onClick={onClose}>Cancel</button>
//         </div>
//       </div>
//     </div>
//   );
// }
//
// export default BackgroundSettingsModal;
