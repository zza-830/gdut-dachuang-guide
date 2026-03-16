// 立项准备页面
import React, { useState } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { FaImage } from 'react-icons/fa';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

// 图片组件（带错误处理和点击放大功能）
const ImageWithFallback = ({ src, alt, fallbackText, description, onClick }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <>
        <div style={{ 
          height: '300px', 
          backgroundColor: '#E9ECEF', 
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6C757D',
          marginBottom: '10px',
          border: '2px dashed #CED4DA'
        }}>
          <FaImage size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p style={{ fontSize: '16px', fontWeight: '500', margin: 0, marginBottom: '8px' }}>
            {fallbackText}
          </p>
          <p style={{ fontSize: '12px', color: '#868E96', margin: 0 }}>
            请将图片文件放到 public/images/ 文件夹
          </p>
        </div>
        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{description}</p>
      </>
    );
  }

  return (
    <>
      <img 
        src={src} 
        alt={alt}
        onClick={onClick}
        style={{ 
          width: '100%',
          maxWidth: '800px',
          height: 'auto',
          borderRadius: '4px',
          marginBottom: '10px',
          border: '1px solid #DEE2E6',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onError={() => setImageError(true)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
      />
      <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{description}</p>
    </>
  );
};

const GuidePreparation = () => {
  // Lightbox状态管理
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  // 图片数据
  const images = [
    {
      src: "/images/preparation-login.png.jpg",
      alt: "登录页面：点击门户登录",
      description: "登录页面：点击门户登录"
    },
    {
      src: "/images/preparation-auth.png.jpg",
      alt: "统一身份认证登录页面",
      description: "统一身份认证登录页面"
    },
    {
      src: "/images/preparation-list.png.jpg",
      alt: "申报项目列表页面",
      description: "申报项目列表页面"
    },
    {
      src: "/images/preparation-form.png.jpg",
      alt: "申报项目新增页面",
      description: "申报项目新增页面"
    }
  ];

  // 处理图片点击
  const handleImageClick = (imageIndex) => {
    setIndex(imageIndex);
    setOpen(true);
  };

  return (
    <Container fluid className="p-4" style={{ backgroundColor: '#F0F4F8', minHeight: 'calc(100vh - 60px)' }}>
      <Row className="g-4 justify-content-center">
        {/* Main Content */}
        <Col xs={12} md={10} lg={8}>
          <Card className="card-modern mb-4">
            <Card.Body style={{ padding: '30px' }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#001F3F', 
                marginBottom: '16px',
                fontFamily: 'sans-serif'
              }}>
                立项准备(10月份中立项)
              </h2>
              <p style={{ 
                fontSize: '16px', 
                color: '#666666',
                marginBottom: '16px',
                lineHeight: '1.5',
                fontFamily: 'sans-serif'
              }}>
                包括找队员、选队长、指定监工、匹配老师。
              </p>
              <p style={{ 
                fontSize: '16px', 
                color: '#666666',
                marginBottom: '24px',
                lineHeight: '1.5',
                fontFamily: 'sans-serif'
              }}>
                访问系统：<a href="http://dcxt.gdut.edu.cn" target="_blank" rel="noopener noreferrer" style={{ color: '#007BFF' }}>http://dcxt.gdut.edu.cn</a>
              </p>

              {/* Images Section */}
              <div className="mb-4">
                <Row className="g-3">
                  {images.map((image, imageIndex) => (
                    <Col xs={12} key={imageIndex}>
                      <div style={{ 
                        backgroundColor: '#F8F9FA', 
                        padding: '20px', 
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <ImageWithFallback 
                          src={image.src}
                          alt={image.alt}
                          fallbackText={image.description}
                          description={image.description}
                          onClick={() => handleImageClick(imageIndex)}
                        />
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>

              {/* Lightbox组件 */}
              <Lightbox
                open={open}
                close={() => setOpen(false)}
                index={index}
                slides={images.map(img => ({ src: img.src, alt: img.alt }))}
                plugins={[Zoom]}
                zoom={{
                  maxZoomPixelRatio: 3,
                  zoomInMultiplier: 1.5,
                  doubleTapDelay: 300,
                  doubleClickDelay: 300,
                  doubleClickMaxStops: 2,
                  keyboardMoveDistance: 50,
                  wheelZoomDistanceFactor: 100,
                  pinchZoomDistanceFactor: 100,
                  scrollToZoom: true
                }}
              />

              <Alert variant="info" style={{ borderLeft: '4px solid #00BFFF' }}>
                <strong>提示：</strong>请按照系统提示完成立项准备，确保团队成员、队长、监工和导师信息填写完整。
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GuidePreparation;

