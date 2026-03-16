import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer 
      style={{ 
        height: '40px', 
        backgroundColor: '#f8f9fa', 
        borderTop: '1px solid #dee2e6',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1030,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Container fluid>
        <Row className="align-items-center">
          <Col xs={12} md={4} className="text-center text-md-start">
            <small>
              <a href="#contact" style={{ textDecoration: 'none', color: 'inherit' }}>
                联系导师
              </a>
            </small>
          </Col>
          <Col xs={12} md={4} className="text-center">
            <small>© GDUT 2026</small>
          </Col>
          <Col xs={12} md={4} className="text-center text-md-end">
            <small>
              <a href="#faq" style={{ textDecoration: 'none', color: 'inherit' }} className="me-3">
                常见问题
              </a>
              <a href="#updates" style={{ textDecoration: 'none', color: 'inherit' }}>
                更新日志
              </a>
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;











